import secrets
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy import text
from backend.app.services.agent_builder import build_agent
from backend.app.db.database import engine  # your existing engine

router = APIRouter()

@router.post("/agents/build")
def build_and_download_agent(
    nickname: str = Query(..., description="Agent nickname"),
    os: str = Query(..., regex="^(windows|linux|darwin)$", description="Target OS"),
):
    try:
        # ✅ Secure token
        token = secrets.token_hex(32)

        # Build the agent file
        built_file = build_agent(nickname, os, token)
        file_path = Path(built_file)

        # ✅ Save into DB using raw SQL
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO agents (nickname, os, static_token)
                    VALUES (:nickname, :os, :token)
                """),
                {"nickname": nickname, "os": os, "token": token}
            )
            conn.commit()

        # ✅ Return file for download
        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=file_path.name
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
