import csv
import io
import json
from fastapi.responses import StreamingResponse


def export_to_csv(headers, rows, filename="export.csv"):
    """Return a CSV StreamingResponse from headers and rows."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


def export_to_json(data, filename="export.json"):
    """Return a JSON StreamingResponse."""
    output = io.StringIO()
    json.dump(data, output, indent=4)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
