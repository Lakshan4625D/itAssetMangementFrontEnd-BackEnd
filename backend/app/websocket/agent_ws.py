import json
from fastapi import WebSocket, WebSocketDisconnect
from backend.app.services.agent_manager import agent_manager


async def agent_websocket(websocket: WebSocket):
    await websocket.accept()

    await websocket.send_text(json.dumps({
        "type": "AUTH_REQUEST"
    }))

    try:
        auth_data = json.loads(await websocket.receive_text())

        if auth_data["type"] != "AUTH_RESPONSE":
            await websocket.close()
            return

        agent_id = await agent_manager.authenticate(
            websocket,
            auth_data["token"]
        )

        if not agent_id:
            await websocket.close()
            return

        await websocket.send_text(json.dumps({
            "type": "AUTH_OK"
        }))

        while True:
            message = json.loads(await websocket.receive_text())

            if message["type"] == "TELEMETRY":
                await agent_manager.save_telemetry(
                    agent_id,
                    message["data"]
                )

    except WebSocketDisconnect:
        await agent_manager.disconnect(agent_id)