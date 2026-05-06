from fastapi import APIRouter
from sqlalchemy import text
from backend.app.db.database import engine
from backend.app.services.agent_manager import agent_manager

router = APIRouter(prefix="/api/agents_controler")


@router.get("")
def list_agents():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                a.id,
                a.nickname,
                a.os,
                COALESCE(
                    (
                        SELECT status
                        FROM agent_sessions s
                        WHERE s.agent_id = a.id
                        ORDER BY connected_at DESC
                        LIMIT 1
                    ),
                    'offline'
                ) as status
            FROM agents a
        """))

        return [dict(row._mapping) for row in result]


@router.post("/scan")
async def scan_all():
    for agent_id in list(agent_manager.connections.keys()):
        await agent_manager.send_command(agent_id, "COLLECT_INFO")
    return {"success": True}


@router.post("/{agent_id}/collect")
async def collect(agent_id: int):
    ok = await agent_manager.send_command(agent_id, "COLLECT_INFO")
    return {"success": ok}


@router.post("/{agent_id}/retry")
def retry(agent_id: int):
    return {"success": True, "message": "Waiting for reconnect"}