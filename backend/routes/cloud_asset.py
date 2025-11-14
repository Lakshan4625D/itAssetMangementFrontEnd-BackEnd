# backend/routes/cloud_assets.py
from fastapi import APIRouter, HTTPException, Form
from sqlalchemy import text
from app.db.database import engine  # same style you used

# Import your scan functions
from app.services.aws_scan import get_aws_resources
from app.services.azure_scan import get_azure_resources
from app.services.gcp_scan import get_gcp_resources

router = APIRouter()


# -------------------------
# Run Cloud Asset Scan
# -------------------------
@router.post("/cloud-asset/scan")
def run_scan(
    provider: str = Form(...),
    # AWS params
    aws_access_key: str = Form(None),
    aws_secret_key: str = Form(None),
    aws_region: str = Form("us-east-1"),
    # Azure params
    azure_tenant_id: str = Form(None),
    azure_client_id: str = Form(None),
    azure_client_secret: str = Form(None),
    azure_subscription_id: str = Form(None),
    # GCP params
    gcp_project_id: str = Form(None),
    gcp_credentials_path: str = Form(None),
):
    try:
        if provider == "aws":
            if not aws_access_key or not aws_secret_key:
                raise HTTPException(status_code=400, detail="AWS credentials required")
            return get_aws_resources(aws_access_key, aws_secret_key, aws_region)

        elif provider == "azure":
            if not (azure_tenant_id and azure_client_id and azure_client_secret and azure_subscription_id):
                raise HTTPException(status_code=400, detail="Azure parameters required")
            return get_azure_resources(
                azure_tenant_id,
                azure_client_id,
                azure_client_secret,
                azure_subscription_id,
            )

        elif provider == "gcp":
            if not (gcp_project_id and gcp_credentials_path):
                raise HTTPException(status_code=400, detail="GCP parameters required")
            return get_gcp_resources(gcp_project_id, gcp_credentials_path)

        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


