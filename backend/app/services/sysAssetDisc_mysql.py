import winrm
import paramiko
import json
import mysql.connector
from datetime import datetime
from backend.app.services.netAssetDisc_mysql import DB_CONFIG

def run_winrm_command(ip, username, password):
    session = winrm.Session(f'http://{ip}:5985/wsman', auth=(username, password), transport='ntlm')
    result = session.run_cmd('systeminfo')
    return result.std_out.decode() if result.status_code == 0 else None

def get_installed_software_win(ip, username, password):
    session = winrm.Session(f'http://{ip}:5985/wsman', auth=(username, password), transport='ntlm')
    ps_script = """
    $paths = @(
      'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
      'HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
    )
    $software = foreach ($path in $paths) {
      Get-ItemProperty $path | Select-Object DisplayName, DisplayVersion, Publisher, InstallLocation, DisplayIcon
    }
    $software | Where-Object { $_.DisplayName -ne $null } | ConvertTo-Json -Depth 3
    """
    result = session.run_ps(ps_script)
    try:
        return json.loads(result.std_out.decode())
    except:
        return []

def run_ssh_command(ip, username, password, cmd):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(ip, username=username, password=password, timeout=10)
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        client.close()
        return out.strip()
    except:
        return None

def detect_remote_os_ssh(ip, username, password):
    return run_ssh_command(ip, username, password, "uname -s")

def get_linux_info(ip, username, password):
    return run_ssh_command(ip, username, password, "uname -a")

def get_installed_software_unix(ip, username, password):
    cmds = [
        ("dpkg-query -W -f='${Package} ${Version} ${Architecture} ${Installed-Size} ${Priority} ${Status} ${Description}\n'", "dpkg"),
        ("rpm -qa --queryformat '%{NAME} %{VERSION} %{ARCH} %{INSTALLTIME:date} %{SUMMARY}\n'", "rpm"),
        ("brew list --versions", "brew")
    ]
    for cmd, pkg_type in cmds:
        out = run_ssh_command(ip, username, password, cmd)
        if out:
            apps = []
            for line in out.strip().splitlines():
                parts = line.split()
                if parts:
                    name = parts[0]
                    version = parts[1] if len(parts) > 1 else ""
                    path_cmd = f"which {name}"
                    install_path = run_ssh_command(ip, username, password, path_cmd) or ""
                    apps.append({
                        "DisplayName": name,
                        "DisplayVersion": version,
                        "Publisher": pkg_type,
                        "InstallPath": install_path
                    })
            return apps
    return []

def save_system_info(ip, os_type, sys_info, apps):
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cur.execute("SELECT id FROM systems WHERE ip = %s", (ip,))
    row = cur.fetchone()
    if row:
        system_id = row[0]
        cur.execute("UPDATE systems SET os_type=%s, details=%s, last_scanned=%s WHERE id=%s",
                    (os_type, sys_info, now, system_id))
        cur.execute("DELETE FROM applications WHERE system_id=%s", (system_id,))
    else:
        cur.execute("INSERT INTO systems (ip, os_type, details, last_scanned) VALUES (%s, %s, %s, %s)",
                    (ip, os_type, sys_info, now))
        system_id = cur.lastrowid

    for app in apps:
        cur.execute("""
            INSERT INTO applications (system_id, name, version, publisher, install_path)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            system_id,
            app.get("DisplayName", ""),
            app.get("DisplayVersion", ""),
            app.get("Publisher", ""),
            app.get("InstallPath", "")
        ))

    conn.commit()
    conn.close()

def detect_and_store_system(ip, username, password):
    os_type = "Unknown"
    sys_info = ""
    apps = []

    output = run_winrm_command(ip, username, password)
    if output:
        os_type = "Windows"
        sys_info = output
        apps = get_installed_software_win(ip, username, password)
        for app in apps:
            app["InstallPath"] = app.get("InstallLocation") or app.get("DisplayIcon") or ""
    else:
        os_out = detect_remote_os_ssh(ip, username, password)
        if os_out:
            os_type = os_out
            sys_info = get_linux_info(ip, username, password)
            apps = get_installed_software_unix(ip, username, password)

    save_system_info(ip, os_type, sys_info, apps)
    return os_type, sys_info, apps
