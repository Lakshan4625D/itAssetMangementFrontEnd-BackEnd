# backend/routes/scans.py
from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import re
from backend.app.db.database import engine  

router = APIRouter()

@router.get("/scan-history")
def get_scan_history():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT n.ip_range, n.scan_time, d.ip, d.hostname, d.os, d.mac, d.device_type
            FROM networks n
            JOIN devices d ON n.id = d.network_id
            ORDER BY n.ip_range, d.ip
        """)).fetchall()

    subnets = {}
    for row in result:
        subnet = row.ip_range
        if subnet not in subnets:
            subnets[subnet] = {
                "subnet": subnet,
                "lastScan": row.scan_time.strftime("%Y-%m-%d %H:%M") if row.scan_time else None,
                "devices": []
            }
        subnets[subnet]["devices"].append({
            "ip": row.ip,
            "hostname": row.hostname,
            "os": row.os,
            "mac": row.mac,
            "type": row.device_type,
            "status": "Active",
            "lastSeen": row.scan_time.strftime("%Y-%m-%d %H:%M") if row.scan_time else None
        })

    return list(subnets.values())


@router.get("/devices-table")
def get_devices_table():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                n.ip_range,
                n.scan_time,
                d.ip,
                d.hostname,
                d.os,
                d.mac,
                d.device_type
            FROM devices d
            JOIN networks n ON n.id = d.network_id
            INNER JOIN (
                SELECT ip, MAX(id) AS latest_id
                FROM devices
                GROUP BY ip
            ) latest ON d.ip = latest.ip AND d.id = latest.latest_id
            ORDER BY n.ip_range, n.scan_time DESC;
        """)).fetchall()

    subnets = {}
    for row in result:
        subnet = row.ip_range
        if subnet not in subnets:
            subnets[subnet] = {
                "subnet": subnet,
                "lastScan": row.scan_time.strftime("%Y-%m-%d %H:%M") if row.scan_time else None,
                "devices": []
            }
        subnets[subnet]["devices"].append({
            "ip": row.ip,
            "hostname": row.hostname,
            "os": row.os,
            "mac": row.mac,
            "type": row.device_type,
            "status": "Active",
            "lastSeen": row.scan_time.strftime("%Y-%m-%d %H:%M") if row.scan_time else None
        })

    return list(subnets.values())


@router.get("/applications/{ip}")
def get_applications(ip: str):
    with engine.connect() as conn:
        system = conn.execute(
            text("SELECT id, os_type, last_scanned FROM systems WHERE ip = :ip"),
            {"ip": ip}
        ).fetchone()

        if not system:
            raise HTTPException(status_code=404, detail="System not found")

        apps = conn.execute(
            text("SELECT name, version, publisher FROM applications WHERE system_id = :sid"),
            {"sid": system.id}
        ).fetchall()

    return {
        "ip": ip,
        "os": system.os_type,
        "lastUpdated": system.last_scanned.strftime("%Y-%m-%d %H:%M") if system.last_scanned else None,
        "applications": [
            {"name": a.name, "version": a.version, "publisher": a.publisher}
            for a in apps
        ],
        "malwareScan": "Clean"
    }


def parse_details(raw_details: str):
    details = {}

    def extract(pattern):
        match = re.search(pattern, raw_details)
        return match.group(1).strip() if match else None

    details["host_name"] = extract(r"Host Name:\s+(.+)")
    details["os_name"] = extract(r"OS Name:\s+(.+)")
    details["os_version"] = extract(r"OS Version:\s+(.+)")
    details["manufacturer"] = extract(r"System Manufacturer:\s+(.+)")
    details["model"] = extract(r"System Model:\s+(.+)")
    details["system_type"] = extract(r"System Type:\s+(.+)")
    details["bios_version"] = extract(r"BIOS Version:\s+(.+)")

    details["total_physical_memory"] = extract(r"Total Physical Memory:\s+(.+)")
    details["available_physical_memory"] = extract(r"Available Physical Memory:\s+(.+)")
    details["virtual_memory_max"] = extract(r"Virtual Memory: Max Size:\s+(.+)")
    details["virtual_memory_available"] = extract(r"Virtual Memory: Available:\s+(.+)")

    details["boot_time"] = extract(r"System Boot Time:\s+(.+)")
    hotfixes = re.findall(r"\[(\d+)\]: (KB\d+)", raw_details)
    details["hotfixes"] = [hf[1] for hf in hotfixes]

    details["network_adapter"] = extract(r"Network Card\(s\):.*?\[01\]: (.+)")
    details["domain"] = extract(r"Domain:\s+(.+)")

    return details


@router.get("/system-details/{ip}")
def get_system_details(ip: str):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT os_type, details, last_scanned FROM systems WHERE ip = :ip"),
            {"ip": ip}
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="System not found")

    parsed = parse_details(row.details)

    return {
        "ip": ip,
        "os": row.os_type,
        "lastUpdated": row.last_scanned.strftime("%Y-%m-%d %H:%M") if row.last_scanned else None,
        **parsed
    }

ASSET_TABLES = {
    "aws": {"aws_ec2": "id", "aws_s3": "name", "aws_ecs": "name", "aws_iam_users": "username"},
    "azure": {"azure_vms": "name", "azure_storage_accounts": "name", "azure_aks_clusters": "name", "azure_iam_users": "username"},
    "gcp": {"gcp_vms": "name", "gcp_buckets": "name", "gcp_gke_clusters": "name", "gcp_iam_users": "username"},
}

@router.get("/cloud-assets/summary")
def get_cloud_summary():
    with engine.connect() as conn:
        summary = {}

        for provider, tables in ASSET_TABLES.items():
            total = 0
            for table, unique_col in tables.items():
                query = text(f"""
                    SELECT COUNT(*) FROM (
                        SELECT t.{unique_col}, MAX(csh.scan_time) AS latest
                        FROM {table} t
                        JOIN cloud_scan_history csh ON t.scan_id = csh.id
                        GROUP BY t.{unique_col}
                    ) AS dedup
                """)
                count = conn.execute(query).scalar() or 0
                total += count

            summary[provider] = total

        return summary
    
@router.get("/cloud-scan-history")
def get_cloud_scan_history():
    query = """
        SELECT h.id AS scan_id, 
               h.provider,
               h.scan_time,
               COALESCE(vm_count, 0) AS vms,
               COALESCE(bucket_count, 0) AS buckets,
               COALESCE(cluster_count, 0) AS clusters
        FROM cloud_scan_history h
        LEFT JOIN (
            SELECT scan_id, COUNT(*) AS vm_count FROM (
                SELECT scan_id FROM aws_ec2
                UNION ALL
                SELECT scan_id FROM azure_vms
                UNION ALL
                SELECT scan_id FROM gcp_vms
            ) vms GROUP BY scan_id
        ) v ON h.id = v.scan_id
        LEFT JOIN (
            SELECT scan_id, COUNT(*) AS bucket_count FROM (
                SELECT scan_id FROM aws_s3
                UNION ALL
                SELECT scan_id FROM azure_storage_accounts
                UNION ALL
                SELECT scan_id FROM gcp_buckets
            ) b GROUP BY scan_id
        ) b ON h.id = b.scan_id
        LEFT JOIN (
            SELECT scan_id, COUNT(*) AS cluster_count FROM (
                SELECT scan_id FROM aws_ecs
                UNION ALL
                SELECT scan_id FROM azure_aks_clusters
                UNION ALL
                SELECT scan_id FROM gcp_gke_clusters
            ) c GROUP BY scan_id
        ) c ON h.id = c.scan_id
        ORDER BY h.id DESC;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query)).mappings().all()
    return {"history": [dict(row) for row in result]}

@router.get("/cloud-scans/{scan_id}")
def get_cloud_scan_info(scan_id: int):
    """
    Returns detailed information about a given cloud scan.
    Dynamically fetches resources based on provider.
    """

    with engine.connect() as conn:
        # 1. Get scan metadata
        scan = conn.execute(text("""
            SELECT id, provider, scan_time
            FROM cloud_scan_history
            WHERE id = :scan_id
        """), {"scan_id": scan_id}).fetchone()

        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")

        provider = scan.provider.lower()

        # 2. Query based on provider
        vms, buckets, clusters, iam_users = [], [], [], []

        if provider == "aws":
            vms = conn.execute(text("""
                SELECT id AS instance_id, type, state, launch_time, public_ip, region
                FROM aws_ec2 WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            buckets = conn.execute(text("""
                SELECT name, creation_date
                FROM aws_s3 WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            clusters = conn.execute(text("""
                SELECT name, status, active_services, running_tasks, region
                FROM aws_ecs WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            iam_users = conn.execute(text("""
                SELECT username, created
                FROM aws_iam_users WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

        elif provider == "azure":
            vms = conn.execute(text("""
                SELECT name, location, vm_type, vm_size
                FROM azure_vms WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            buckets = conn.execute(text("""
                SELECT name, location, kind, sku
                FROM azure_storage_accounts WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            clusters = conn.execute(text("""
                SELECT name, location, version, dns_prefix
                FROM azure_aks_clusters WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            iam_users = conn.execute(text("""
                SELECT username, created
                FROM azure_iam_users WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

        elif provider == "gcp":
            vms = conn.execute(text("""
                SELECT name, zone, status, machine_type
                FROM gcp_vms WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            buckets = conn.execute(text("""
                SELECT name, location, storage_class
                FROM gcp_buckets WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            clusters = conn.execute(text("""
                SELECT name, location, status, endpoint
                FROM gcp_gke_clusters WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

            iam_users = conn.execute(text("""
                SELECT username, role, created
                FROM gcp_iam_users WHERE scan_id = :scan_id
            """), {"scan_id": scan_id}).mappings().all()

    # 3. Return unified response
    return {
        "scan": {
            "id": scan.id,
            "provider": scan.provider.upper(),
            "scan_time": scan.scan_time,
            "status": "Completed"  # placeholder, you can extend schema later
        },
        "summary": {
            "total_vms": len(vms),
            "total_buckets": len(buckets),
            "total_clusters": len(clusters),
            "total_iam_users": len(iam_users),
        },
        "vms": vms,
        "buckets": buckets,
        "clusters": clusters,
        "iam_users": iam_users,
    }

provider_tables = {
    "aws": ["aws_ec2", "aws_s3", "aws_ecs", "aws_iam_users"],
    "azure": ["azure_vms", "azure_storage_accounts", "azure_aks_clusters", "azure_iam_users"],
    "gcp": ["gcp_vms", "gcp_buckets", "gcp_gke_clusters", "gcp_iam_users"],
}

table_unique_cols = {
    "aws_ec2": "id",
    "aws_s3": "name",
    "aws_ecs": "name",
    "aws_iam_users": "username",
    
    "azure_vms": "name",
    "azure_storage_accounts": "name",
    "azure_aks_clusters": "name",
    "azure_iam_users": "username",

    "gcp_vms": "name",
    "gcp_buckets": "name",
    "gcp_gke_clusters": "name",
    "gcp_iam_users": "username",
}

@router.get("/cloud/{provider}/latest")
def get_latest_provider_data(provider: str):
    provider = provider.lower()
    if provider not in provider_tables:
        raise HTTPException(status_code=400, detail="Invalid provider")

    result = {}

    with engine.connect() as conn:
        for table in provider_tables[provider]:
            unique_col = table_unique_cols.get(table)
            if not unique_col:
                continue  # skip table if we don't know unique col

            sql = f"""
                SELECT t.*
                FROM {table} t
                INNER JOIN (
                    SELECT {unique_col}, MAX(scan_id) as max_scan
                    FROM {table}
                    GROUP BY {unique_col}
                ) latest
                ON t.{unique_col} = latest.{unique_col} AND t.scan_id = latest.max_scan
            """
            rows = conn.execute(text(sql)).mappings().all()
            result[table] = [dict(row) for row in rows]

    return result

@router.get("/vulnerabilities/all")
def get_all_vulnerabilities():
    """
    Get all vulnerabilities with device IP + hostname.
    """
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                d.ip AS device_ip,
                d.hostname AS device_hostname,
                v.port,
                v.vulnerability_id,
                v.vulnerability_description,
                v.severity
            FROM vulnerabilities v
            JOIN devices d ON v.device_id = d.id
            ORDER BY d.ip, v.id DESC;
        """)).fetchall()

    if not result:
        raise HTTPException(status_code=404, detail="No vulnerabilities found")

    return {
        "vulnerabilities": [
            {
                "device_ip": row.device_ip,
                "device_hostname": row.device_hostname,
                "port": row.port,
                "vulnerability_id": row.vulnerability_id,
                "vulnerability_description": row.vulnerability_description,
                "severity": row.severity
            }
            for row in result
        ]
    }

@router.get("/malware-detections")
def get_malware_detections():
    """
    Fetch all malware detections with system details.
    """
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                s.ip AS device_ip,
                s.os_type AS hostname,  -- if you store real hostname elsewhere, replace this
                m.application_name,
                m.file_path,
                m.signature,
                m.scan_time
            FROM malware_detections m
            JOIN systems s ON m.system_id = s.id
            ORDER BY m.scan_time DESC;
        """)).fetchall()

    if not result:
        raise HTTPException(status_code=404, detail="No malware detections found")

    detections = []
    for row in result:
        # Example severity mapping from signature keywords
        severity = "Unknown"
        if row.signature:
            sig = row.signature.lower()
            if "trojan" in sig:
                severity = "High"
            elif "virus" in sig:
                severity = "Medium"
            elif "generic" in sig:
                severity = "Low"
            elif "clean" in sig:
                severity = "Clean"

        detections.append({
            "device_ip": row.device_ip,
            "hostname": row.hostname,
            "software_name": row.application_name,
            "file_path": row.file_path,
            "vulnerability": row.signature,
            "scan_time": row.scan_time,
            "severity": severity
        })

    return {"malware_detections": detections}

@router.get("/agents/fetchall")
def fetch_all_agents():
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, nickname, os, static_token, created_at FROM agents")
            )
            rows = [dict(row._mapping) for row in result]  # Row -> dict
        return {"agents": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))