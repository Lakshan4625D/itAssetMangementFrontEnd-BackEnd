# backend/routes/delete.py
from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import re
from backend.app.db.database import engine  

router = APIRouter()

@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: int):
    try:
        with engine.begin() as conn:  # begin ensures commit/rollback
            result = conn.execute(
                text("DELETE FROM agents WHERE id = :id"), {"id": agent_id}
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Agent not found")
        return {"message": f"Agent {agent_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))