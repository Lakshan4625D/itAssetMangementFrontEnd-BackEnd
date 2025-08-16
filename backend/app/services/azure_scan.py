from azure.identity import ClientSecretCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.containerservice import ContainerServiceClient
from azure.core.exceptions import AzureError
import mysql.connector
import requests
from datetime import datetime

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'network_scanner'
}


def get_azure_resources(tenant_id, client_id, client_secret, subscription_id):
    result = {
        "vms": [],
        "storage_accounts": [],
        "aks_clusters": [],
        "iam_users": [],
        "error": None
    }

    try:
        # Auth
        credential = ClientSecretCredential(tenant_id=tenant_id,
                                            client_id=client_id,
                                            client_secret=client_secret)

        compute_client = ComputeManagementClient(credential, subscription_id)
        storage_client = StorageManagementClient(credential, subscription_id)
        container_client = ContainerServiceClient(credential, subscription_id)

        # DB setup
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Create tables if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cloud_scan_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                provider ENUM('aws','azure','gcp') NOT NULL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS azure_vms (
                name VARCHAR(100) PRIMARY KEY,
                location VARCHAR(100),
                vm_type VARCHAR(100),
                vm_size VARCHAR(100),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS azure_storage_accounts (
                name VARCHAR(100) PRIMARY KEY,
                location VARCHAR(100),
                kind VARCHAR(50),
                sku VARCHAR(50),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS azure_aks_clusters (
                name VARCHAR(100) PRIMARY KEY,
                location VARCHAR(100),
                version VARCHAR(50),
                dns_prefix VARCHAR(100),
                scan_id INT,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS azure_iam_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scan_id INT,
                username VARCHAR(255),
                created DATETIME,
                FOREIGN KEY (scan_id) REFERENCES cloud_scan_history(id) ON DELETE SET NULL
            )
        ''')

        # Insert scan record
        cursor.execute("INSERT INTO cloud_scan_history (provider) VALUES ('azure')")
        scan_id = cursor.lastrowid

        # VMs
        for vm in compute_client.virtual_machines.list_all():
            name = vm.name
            location = vm.location
            vm_type = vm.type
            vm_size = vm.hardware_profile.vm_size if vm.hardware_profile else "N/A"

            result["vms"].append({
                "name": name,
                "location": location,
                "type": vm_type,
                "vm_size": vm_size
            })

            cursor.execute('''
                INSERT INTO azure_vms (name, location, vm_type, vm_size, scan_id)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    location=VALUES(location),
                    vm_type=VALUES(vm_type),
                    vm_size=VALUES(vm_size),
                    scan_id=VALUES(scan_id)
            ''', (name, location, vm_type, vm_size, scan_id))

        # Storage Accounts
        for sa in storage_client.storage_accounts.list():
            result["storage_accounts"].append({
                "name": sa.name,
                "location": sa.location,
                "kind": sa.kind,
                "sku": sa.sku.name
            })

            cursor.execute('''
                INSERT INTO azure_storage_accounts (name, location, kind, sku, scan_id)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    location=VALUES(location),
                    kind=VALUES(kind),
                    sku=VALUES(sku),
                    scan_id=VALUES(scan_id)
            ''', (sa.name, sa.location, sa.kind, sa.sku.name, scan_id))

        # AKS Clusters
        for cluster in container_client.managed_clusters.list():
            result["aks_clusters"].append({
                "name": cluster.name,
                "location": cluster.location,
                "kubernetes_version": cluster.kubernetes_version,
                "dns_prefix": cluster.dns_prefix
            })

            cursor.execute('''
                INSERT INTO azure_aks_clusters (name, location, version, dns_prefix, scan_id)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    location=VALUES(location),
                    version=VALUES(version),
                    dns_prefix=VALUES(dns_prefix),
                    scan_id=VALUES(scan_id)
            ''', (cluster.name, cluster.location, cluster.kubernetes_version, cluster.dns_prefix, scan_id))

        # IAM Users from Graph API
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        graph_url = "https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,createdDateTime"

        data = {
            'client_id': client_id,
            'scope': 'https://graph.microsoft.com/.default',
            'client_secret': client_secret,
            'grant_type': 'client_credentials'
        }

        token_res = requests.post(token_url, data=data)
        access_token = token_res.json().get('access_token')

        if access_token:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(graph_url, headers=headers)
            users = response.json().get('value', [])

            for user in users:
                username = user.get("userPrincipalName", "N/A")
                created_raw = user.get("createdDateTime", None)
                if created_raw:
                    created = datetime.fromisoformat(created_raw.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S")
                else:
                    created = None
                result["iam_users"].append({
                    "username": username,
                    "created": created
                })

                cursor.execute('''
                    INSERT INTO azure_iam_users (scan_id, username, created)
                    VALUES (%s, %s, %s)
                ''', (scan_id, username, created))
        else:
            result["error"] = "Failed to get Azure access token"

        conn.commit()

    except AzureError as e:
        result["error"] = str(e)

    except Exception as e:
        result["error"] = str(e)

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

    return result
