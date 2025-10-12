from pathlib import Path
import os, re, subprocess, shutil, tempfile

# go two levels up from services -> app -> backend
BACKEND_ROOT = Path(__file__).resolve().parents[2]
GO_MOD_ROOT = BACKEND_ROOT / "agent_builder"      # where go.mod lives
AGENT_TEMPLATE_DIR = GO_MOD_ROOT / "agents"       # templates folder

TEMPLATE_MAP = {
    "windows": ("base_windows.go", "windows", ".exe"),
    "linux":   ("base_linux.go", "linux", ""),
    "darwin":  ("base_mac.go", "darwin", ""),
}

def prepare_source(template_path: Path, token: str, nickname: str) -> Path:
    src = template_path.read_text(encoding="utf-8")
    quoted_token = f"\"{token}\""
    src = src.replace("__STATIC_TOKEN__", quoted_token)

    if "AgentNickname" not in src:
        src = src.replace("const (", f'const (\n\tAgentNickname = "{nickname}"')

    tmp_dir = tempfile.mkdtemp(prefix="agent_build_")
    tmp_file = Path(tmp_dir) / template_path.name
    tmp_file.write_text(src, encoding="utf-8")
    return tmp_file

def go_build(gofile_path: Path, goos: str, goarch: str, out_path: Path):
    env = os.environ.copy()
    env["GOOS"] = goos
    env["GOARCH"] = goarch

    cmd = ["go", "build", "-o", str(out_path), str(gofile_path)]
    proc = subprocess.run(
        cmd,
        cwd=GO_MOD_ROOT,   # ✅ run inside the folder with go.mod
        env=env,
        capture_output=True,
        text=True
    )
    return proc.returncode, proc.stdout + proc.stderr

def build_agent(nickname: str, target: str, token: str, arch: str = "amd64") -> str:
    target_lc = target.lower()
    if target_lc not in TEMPLATE_MAP:
        raise ValueError(f"Unsupported target '{target}'. Must be one of {list(TEMPLATE_MAP.keys())}")

    template_file, goos, ext = TEMPLATE_MAP[target_lc]
    template_path = AGENT_TEMPLATE_DIR / template_file
    if not template_path.exists():
        raise FileNotFoundError(f"Missing template: {template_path}")

    tmp_go = prepare_source(template_path, token, nickname)

    # ✅ new filename format: nickname_os(.exe)
    output_file = AGENT_TEMPLATE_DIR / f"{nickname}_{target_lc}{ext}"

    code, out = go_build(tmp_go, goos, arch, output_file)
    shutil.rmtree(tmp_go.parent, ignore_errors=True)

    if code != 0:
        raise RuntimeError(f"go build failed:\n{out}")

    return str(output_file)
