from fastapi import APIRouter, HTTPException
from backend.app.services import exporter
from backend.routes import scans  # reuse scan functions

router = APIRouter()


@router.get("/export/{dataset}")
def export_data(dataset: str, format: str = "csv", ip: str = None):
    """
    Export data for given dataset.
    Supported datasets: scan-history, devices-table, applications, system-details
    format: csv | json
    """
    try:
        # 1. Pick the right function
        if dataset == "scan-history":
            data = scans.get_scan_history()
        elif dataset == "devices-table":
            data = scans.get_devices_table()
        elif dataset == "applications":
            if not ip:
                raise HTTPException(status_code=400, detail="IP is required for applications export")
            data = scans.get_applications(ip)
        elif dataset == "system-details":
            if not ip:
                raise HTTPException(status_code=400, detail="IP is required for system-details export")
            data = scans.get_system_details(ip)
        else:
            raise HTTPException(status_code=400, detail="Unsupported dataset")

        if not data:
            raise HTTPException(status_code=404, detail="No data found")

        # 2. Format export
        if format == "csv":
            # Flatten depending on dataset shape
            if isinstance(data, list):
                # list of dicts (scan-history, devices-table)
                headers = list(data[0].keys())
                rows = [list(item.values()) for item in data]
            elif isinstance(data, dict):
                # single dict (applications, system-details)
                headers = list(data.keys())
                rows = [list(data.values())]
            else:
                raise HTTPException(status_code=500, detail="Unsupported data structure")

            return exporter.export_to_csv(headers, rows, f"{dataset}.csv")

        elif format == "json":
            return exporter.export_to_json(data, f"{dataset}.json")

        else:
            raise HTTPException(status_code=400, detail="Invalid format")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
