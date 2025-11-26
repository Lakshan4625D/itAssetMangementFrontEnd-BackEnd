from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
# from .api.agent_generator import router as agent_router

app = FastAPI()
from routes import scans
from routes import delete
from routes import dashboard
from routes import netAssetScanFunc
from routes import sysAssetScanFunc
from routes import export
from routes import agent
from routes import cloud_asset

app.include_router(sysAssetScanFunc.router)
app.include_router(scans.router)
app.include_router(delete.router)
app.include_router(dashboard.router)
app.include_router(netAssetScanFunc.router)
app.include_router(export.router)
app.include_router(agent.router)
app.include_router(cloud_asset.router)

# Allow React dev server to call this API
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://frontend:5173",
    "http://frontend:80",
    "http://backend:8000",
    "http://localhost:8000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origins],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_app:app", host="127.0.0.1", port=8000, reload=True)
