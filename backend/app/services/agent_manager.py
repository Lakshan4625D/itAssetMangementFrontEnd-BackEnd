import asyncio
import json
import uuid
from datetime import datetime
from sqlalchemy import text
from backend.app.db.database import engine


class AgentManager:
    def __init__(self):
        self.connections = {}
        self.auto_scan = False

    async def authenticate(self, websocket, token):
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, nickname FROM agents WHERE static_token=:token"),
                {"token": token}
            ).fetchone()

            if not result:
                return None

            agent_id = result[0]
            session_id = str(uuid.uuid4())

            conn.execute(text("""
                INSERT INTO agent_sessions
                (agent_id, status, session_id)
                VALUES (:agent_id, 'online', :session_id)
            """), {
                "agent_id": agent_id,
                "session_id": session_id
            })
            conn.commit()

            self.connections[agent_id] = {
                "ws": websocket,
                "session_id": session_id,
                "last_seen": datetime.utcnow()
            }

            return agent_id

    async def disconnect(self, agent_id):
        if agent_id in self.connections:
            del self.connections[agent_id]

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE agent_sessions
                SET status='offline'
                WHERE agent_id=:agent_id
            """), {"agent_id": agent_id})
            conn.commit()

    async def send_command(self, agent_id, command):
        if agent_id not in self.connections:
            return False

        ws = self.connections[agent_id]["ws"]

        await ws.send_text(json.dumps({
            "type": "COMMAND",
            "command": command
        }))

        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO commands(agent_id, command, status)
                VALUES (:agent_id, :command, 'sent')
            """), {
                "agent_id": agent_id,
                "command": command
            })
            conn.commit()

        return True

    async def save_telemetry(self, agent_id, payload):
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO telemetry(agent_id, payload)
                VALUES (:agent_id, :payload)
            """), {
                "agent_id": agent_id,
                "payload": json.dumps(payload)
            })
            conn.commit()

    async def auto_scan_loop(self):
        while True:
            if self.auto_scan:
                for agent_id in list(self.connections.keys()):
                    await self.send_command(agent_id, "COLLECT_INFO")
            await asyncio.sleep(120)


agent_manager = AgentManager()