from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import re

router = APIRouter()

DB_URL = "mysql+pymysql://root:root@localhost/network_scanner"
engine = create_engine(DB_URL)

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
            "status": "Active",  # placeholder since no status column
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
                -- ensure unique by IP (latest device row)
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
            "status": "Active",  # placeholder
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
