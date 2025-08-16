from google.oauth2 import service_account
from googleapiclient.discovery import build
import mysql.connector
import datetime

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'network_scanner'
}

def get_gcp_resources(project_id, credentials_path):
    result = {
        "vms": [],
        "buckets": [],
        "gke_clusters": [],
        "iam_users": [],
        "error": None
    }

    try:
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        compute = build('compute', 'v1', credentials=credentials)
        storage = build('storage', 'v1', credentials=credentials)
        container = build('container', 'v1', credentials=credentials)
        crm = build('cloudresourcemanager', 'v1', credentials=credentials)

        # DB connection
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Ensure tables exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cloud_scan_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                provider ENUM('aws','azure','gcp') NOT NULL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gcp_vms (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                zone VARCHAR(255),
                machine_type VARCHAR(255),
                status VARCHAR(50),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gcp_buckets (
                name VARCHAR(255) PRIMARY KEY,
                location VARCHAR(255),
                storage_class VARCHAR(50),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gcp_gke_clusters (
                name VARCHAR(255) PRIMARY KEY,
                location VARCHAR(255),
                version VARCHAR(100),
                endpoint VARCHAR(100),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gcp_iam_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scan_id INT,
                username VARCHAR(255),
                role VARCHAR(255),
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        # Create scan record
        cursor.execute("INSERT INTO cloud_scan_history (provider) VALUES ('gcp')")
        scan_id = cursor.lastrowid

        # 🔹 GCP VMs
        zones_req = compute.zones().list(project=project_id).execute()
        zones = [z['name'] for z in zones_req.get('items', [])]

        for zone in zones:
            vms = compute.instances().list(project=project_id, zone=zone).execute()
            for vm in vms.get('items', []):
                vm_id = vm['id']
                name = vm['name']
                machine_type = vm['machineType'].split("/")[-1]
                status = vm.get('status', 'UNKNOWN')

                result["vms"].append({
                    "id": vm_id,
                    "name": name,
                    "zone": zone,
                    "machine_type": machine_type,
                    "status": status
                })

                cursor.execute('''
                    INSERT INTO gcp_vms (id, name, zone, machine_type, status, scan_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name=VALUES(name),
                        zone=VALUES(zone),
                        machine_type=VALUES(machine_type),
                        status=VALUES(status),
                        scan_id=VALUES(scan_id)
                ''', (vm_id, name, zone, machine_type, status, scan_id))

        # 🔹 GCS Buckets
        buckets = storage.buckets().list(project=project_id).execute()
        for bucket in buckets.get('items', []):
            name = bucket['name']
            location = bucket.get('location', 'unknown')
            storage_class = bucket.get('storageClass', 'STANDARD')

            result["buckets"].append({
                "name": name,
                "location": location,
                "storage_class": storage_class
            })

            cursor.execute('''
                INSERT INTO gcp_buckets (name, location, storage_class, scan_id)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    location=VALUES(location),
                    storage_class=VALUES(storage_class),
                    scan_id=VALUES(scan_id)
            ''', (name, location, storage_class, scan_id))

        # 🔹 GKE Clusters
        gke_clusters = container.projects().locations().clusters().list(parent=f"projects/{project_id}/locations/-").execute()
        for cluster in gke_clusters.get("clusters", []):
            name = cluster['name']
            location = cluster['location']
            version = cluster['currentMasterVersion']
            endpoint = cluster.get('endpoint', 'N/A')

            result["gke_clusters"].append({
                "name": name,
                "location": location,
                "version": version,
                "endpoint": endpoint
            })

            cursor.execute('''
                INSERT INTO gcp_gke_clusters (name, location, version, endpoint, scan_id)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    location=VALUES(location),
                    version=VALUES(version),
                    endpoint=VALUES(endpoint),
                    scan_id=VALUES(scan_id)
            ''', (name, location, version, endpoint, scan_id))

        # 🔹 IAM Users
        policy = crm.projects().getIamPolicy(resource=project_id, body={}).execute()
        for binding in policy.get("bindings", []):
            role = binding.get("role")
            members = binding.get("members", [])
            for member in members:
                if member.startswith("user:"):
                    username = member.split(":")[1]
                    result["iam_users"].append({
                        "username": username,
                        "role": role
                    })
                    cursor.execute('''
                        INSERT INTO gcp_iam_users (scan_id, username, role)
                        VALUES (%s, %s, %s)
                    ''', (scan_id, username, role))

        conn.commit()

    except Exception as e:
        result["error"] = str(e)

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

    return result
