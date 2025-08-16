import subprocess
import mysql.connector
import paramiko
import winrm
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from backend.app.services.sysAssetDisc_mysql import DB_CONFIG

MAX_THREADS = 4
SCAN_TIMEOUT = 300  # seconds

def run_clamav_remote(path, os_type, ip, username, password):
    try:
        if os_type.lower() == "windows":
            session = winrm.Session(f'http://{ip}:5985/wsman', auth=(username, password), transport='ntlm')
            ps_script = f'& "C:\\ClamAV\\clamscan.exe" --infected --no-summary -r "{path}"'
            print(f"📤 PowerShell command: {ps_script}")
            result = session.run_ps(ps_script)
            output = result.std_out.decode()
            errors = result.std_err.decode()
            if errors:
                print("❌ STDERR:\n", errors)
            return output
        else:
            # Linux/macOS case
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(ip, username=username, password=password, timeout=10)
            cmd = f'/usr/bin/clamscan --infected --no-summary -r "{path}"'
            stdin, stdout, stderr = client.exec_command(cmd)
            output = stdout.read().decode()
            errors = stderr.read().decode()
            if errors:
                print("❌ STDERR (Linux):", errors)
            client.close()
            return output
    except Exception as e:
        return f"[ERROR] {path}: {e}"

def parse_clamav_output(output):
    detections = []
    for line in output.strip().splitlines():
        if line.strip().endswith("FOUND"):
            try:
                path, sig = line.rsplit(":", 1)
                detections.append((path.strip(), sig.replace("FOUND", "").strip()))
            except ValueError:
                continue
    return detections

def save_clamav_results(system_id, app_name, path, detections):
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    for file_path, signature in detections:
        cur.execute("""
            INSERT INTO malware_detections (system_id, application_name, file_path, signature, scan_time)
            VALUES (%s, %s, %s, %s, %s)
        """, (system_id, app_name, file_path, signature, now))

    conn.commit()
    conn.close()

def scan_all_app_paths(system_id, apps, os_type, ip, username, password):
    def scan_and_store(app):
        name = app.get("DisplayName", "")
        path = app.get("InstallLocation") or app.get("DisplayIcon")
        if path and len(path) > 3:
            print(f"🔍 Scanning: {name} at {path}")
            output = run_clamav_remote(path, os_type, ip, username, password)
            detections = parse_clamav_output(output)
            print(f"[RAW OUTPUT]\n{output}")
            if detections:
                print(f"⚠️ Infected files found in {name}")
                save_clamav_results(system_id, name, path, detections)
            else:
                print(f"✅ Clean: {name}")
        return

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = [executor.submit(scan_and_store, app) for app in apps]
        for f in as_completed(futures):
            _ = f.result()

if __name__ == "__main__":
    ip = '100.127.47.158'
    username = 'laptop-i3rtcp33\mobitel'
    password = 'shanvitha2005'
    os_type = 'windows'
    path_to_scan = r"C:\Program Files (x86)\SysAssetScanner"

    output = run_clamav_remote(path_to_scan, os_type, ip, username, password)
    print("=== Scan Output ===")
    print(output)

    detections = parse_clamav_output(output)
    if detections:
        print("⚠️ Malware found:")
        for path, sig in detections:
            print(f"{path} → {sig}")
    else:
        print("✅ No malware found.")

