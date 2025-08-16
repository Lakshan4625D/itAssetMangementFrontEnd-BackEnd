# backend/routes/netAssetScanFunc.py
from fastapi import APIRouter, BackgroundTasks
import platform
import asyncio
import threading
import time

from backend.app.services.netAssetDisc_mysql import scan_network_combined

router = APIRouter()

# Shared scan status
scan_status = {"status": "idle"}

@router.post("/network/start-scan")
async def start_scan(background_tasks: BackgroundTasks):
    """
    Starts the network scan in the background and updates scan_status.
    """
    global scan_status
    if scan_status["status"] == "scanning":
        return {"status": "Scan already running"}

    scan_status["status"] = "scanning"
    background_tasks.add_task(run_scan)
    return {"status": "Scan started"}

@router.get("/network/scan-status")
async def get_scan_status():
    """Returns the current scan status."""
    return scan_status

def run_scan():
    global scan_status
    try:
        if platform.system() == "Windows":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(scan_network_combined())
        scan_status["status"] = "finished"
    except Exception as e:
        print(f"[ERROR] Scan failed: {e}")
        scan_status["status"] = "error"
    finally:
        # Reset back to idle after 5 seconds so new scans can be started
        def reset_status():
            time.sleep(5)
            scan_status["status"] = "idle"
        threading.Thread(target=reset_status, daemon=True).start()
