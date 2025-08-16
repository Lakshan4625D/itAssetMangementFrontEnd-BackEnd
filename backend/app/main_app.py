from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from .api.agent_generator import router as agent_router

app = FastAPI()
from fastapi import FastAPI
from backend.routes import scans
from backend.routes import netAssetScanFunc
app.include_router(scans.router)
app.include_router(netAssetScanFunc.router)


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
app.include_router(agent_router)

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
