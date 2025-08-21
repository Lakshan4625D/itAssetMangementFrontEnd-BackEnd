# backend/routes/sysAssetScanFunc.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services import sysAssetDisc_mysql

router = APIRouter()

# Input model for request body
class SystemScanRequest(BaseModel):
    ip: str
    username: str
    password: str

@router.post("/system/scan")
def scan_system(request: SystemScanRequest):
    """
    Trigger a system scan (via WinRM/SSH) and return OS + installed apps.
    """
    try:
        os_type, sys_info, apps = sysAssetDisc_mysql.detect_and_store_system(
            request.ip, request.username, request.password
        )

        return {
            "ip": request.ip,
            "os": os_type,
            "details": sys_info[:500],  # return truncated details if too long
            "applications": [
                {
                    "name": app.get("DisplayName", ""),
                    "version": app.get("DisplayVersion", ""),
                    "publisher": app.get("Publisher", ""),
                    "install_path": app.get("InstallPath", ""),
                }
                for app in apps
            ],
            "malwareScan": "Clean"  # placeholder until you wire ClamAV
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
