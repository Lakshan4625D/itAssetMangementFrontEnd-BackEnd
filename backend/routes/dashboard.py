from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.db.database import engine  # same import style you used
from routes.scans import get_cloud_summary  # reuse existing function

router = APIRouter()

# -------------------------
# Dashboard Summary Counters
# -------------------------
@router.get("/dashboard/summary")
def get_summary():
    try:
        with engine.connect() as conn:
            total_devices = conn.execute(text("SELECT COUNT(*) FROM devices")).scalar()
            vulnerabilities = conn.execute(text("SELECT COUNT(*) FROM vulnerabilities")).scalar()

        # reuse your existing cloud summary logic
        cloud_summary = get_cloud_summary()
        cloud_assets = sum(cloud_summary.values())

        return {
            "total_devices": total_devices or 0,
            "cloud_assets": cloud_assets or 0,
            "vulnerabilities": vulnerabilities or 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# Most Recent Network Scan
# -------------------------
@router.get("/dashboard/recent-scan")
def get_recent_scan():
    try:
        with engine.connect() as conn:
            # get the most recent network scan
            latest_network = conn.execute(
                text("SELECT id FROM networks ORDER BY scan_time DESC LIMIT 1")
            ).fetchone()

            if not latest_network:
                return []

            network_id = latest_network[0]

            devices = conn.execute(
                text("""
                    SELECT ip, hostname, os, ports, mac, device_type
                    FROM devices
                    WHERE network_id = :nid
                """),
                {"nid": network_id},
            ).fetchall()

            return [
                {
                    "ip": d.ip,
                    "hostname": d.hostname,
                    "os": d.os,
                    "ports": d.ports,
                    "mac": d.mac,
                    "type": d.device_type,
                }
                for d in devices
            ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
