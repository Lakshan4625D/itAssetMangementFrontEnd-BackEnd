from fastapi import APIRouter, HTTPException
from app.services import exporter
from routes import scans
from routes.dashboard import get_summary, get_recent_scan  # ✅ Reuse existing functions

router = APIRouter()


@router.get("/export/{dataset}")
def export_data(dataset: str, format: str = "csv", ip: str = None):
    """
    Export data for given dataset.
    Supported datasets:
      - scan-history
      - devices-table
      - applications (requires ip)
      - system-details (requires ip)
      - dashboard-overview (summary + recent scan combined)
    format: csv | json
    """
    try:
        # -------------------------
        # 1. Select dataset source
        # -------------------------
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

        elif dataset == "dashboard-overview":
            # ✅ Reuse your summary + recent scan routes
            summary_data = get_summary()
            recent_scan_data = get_recent_scan()

            data = {
                "summary": summary_data,
                "recent_scan": recent_scan_data
            }

        else:
            raise HTTPException(status_code=400, detail="Unsupported dataset")

        if not data:
            raise HTTPException(status_code=404, detail="No data found")

        # -------------------------
        # 2. Export formatting
        # -------------------------
        if format == "csv":
            if dataset == "dashboard-overview":
                # Flatten summary + recent scan into a readable CSV
                summary_rows = [["Metric", "Value"]] + [[k, v] for k, v in data["summary"].items()]
                csv_rows = summary_rows + [[""]]  # blank line separator

                recent_scan = data.get("recent_scan", [])
                if recent_scan:
                    csv_rows += [["IP", "Hostname", "OS", "Ports", "MAC", "Type"]]
                    for d in recent_scan:
                        csv_rows.append([
                            d.get("ip", ""),
                            d.get("hostname", ""),
                            d.get("os", ""),
                            d.get("ports", ""),
                            d.get("mac", ""),
                            d.get("type", ""),
                        ])

                return exporter.export_to_csv([], csv_rows, "dashboard-overview.csv")

            elif isinstance(data, list):
                headers = list(data[0].keys())
                rows = [list(item.values()) for item in data]
                return exporter.export_to_csv(headers, rows, f"{dataset}.csv")

            elif isinstance(data, dict):
                headers = list(data.keys())
                rows = [list(data.values())]
                return exporter.export_to_csv(headers, rows, f"{dataset}.csv")

            else:
                raise HTTPException(status_code=500, detail="Unsupported data structure")

        elif format == "json":
            return exporter.export_to_json(data, f"{dataset}.json")

        else:
            raise HTTPException(status_code=400, detail="Invalid format")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
