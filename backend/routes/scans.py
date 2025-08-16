from fastapi import APIRouter
from sqlalchemy import create_engine, text

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
