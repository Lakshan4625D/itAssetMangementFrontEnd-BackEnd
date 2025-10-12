from fastapi import FastAPI, Form, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import os
import subprocess
import uuid

app = FastAPI()
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate-agent")
async def generate_agent(
    request: Request,
    pc_name: str = Form(...),
    operating_system: str = Form(...)
):
    token = str(uuid.uuid4())

    # Path to base agent
    base_file = f"agents/base_{operating_system}.go"
    if not os.path.exists(base_file):
        return JSONResponse(
            status_code=400,
            content={"error": f"Base file for '{operating_system}' not found."}
        )

    # Output file name and path
    output_filename = f"{pc_name}_{operating_system}_agent"
    output_path = f"static/downloads/{output_filename}"

    if operating_system == "windows":
        output_path += ".exe"
    elif operating_system == "mac":
        output_path += ".app"
    else:
        output_path += ".bin"

    # Create temp Go file with token embedded
    temp_file = f"agents/temp_{uuid.uuid4().hex}.go"
    try:
        with open(base_file, "r") as f:
            content = f.read().replace("__STATIC_TOKEN__", f'"{token}"')
        with open(temp_file, "w") as f:
            f.write(content)

        # Build the Go executable
        result = subprocess.run(["go", "build", "-o", output_path, temp_file],
                                capture_output=True, text=True)

        if result.returncode != 0:
            return JSONResponse(
                status_code=500,
                content={"error": "Build failed", "details": result.stderr}
            )

        return FileResponse(
            path=output_path,
            filename=os.path.basename(output_path),
            media_type="application/octet-stream"
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)
