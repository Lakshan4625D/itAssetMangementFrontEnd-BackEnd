from fastapi import FastAPI, Request, WebSocket
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio
# from .api.agent_generator import router as agent_router

app = FastAPI()
from backend.routes import scans
from backend.routes import delete
from backend.routes import dashboard
from backend.routes import netAssetScanFunc
from backend.routes import sysAssetScanFunc
from backend.routes import export
from backend.routes import agent
from backend.routes import cloud_asset

from backend.routes.agent_controler import router as agents_router
from backend.app.websocket.agent_ws import agent_websocket
from backend.app.services.agent_manager import agent_manager

app.include_router(sysAssetScanFunc.router)
app.include_router(scans.router)
app.include_router(delete.router)
app.include_router(dashboard.router)
app.include_router(netAssetScanFunc.router)
app.include_router(export.router)
app.include_router(agent.router)
app.include_router(cloud_asset.router)
app.include_router(agents_router)

# Allow React dev server to call this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include agent generator router
# app.include_router(agent_router)

class SystemData(BaseModel):
    os_version: list
    system_info: list
    memory_info: list
    bios_info: list
    cpu_info: list
    logical_drives: list
    installed_programs: list

@app.post("/api/upload")
async def receive_data(data: SystemData, request: Request):
    client_host = request.client.host
    print(f"Data received from {client_host}:")
    print(data.dict())
    return {"status": "success", "message": "Data received"}

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await agent_websocket(websocket)


@app.on_event("startup")
async def startup():
    asyncio.create_task(agent_manager.auto_scan_loop())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_app:app", host="127.0.0.1", port=8000, reload=True)
