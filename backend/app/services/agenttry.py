import os
import json
import time
import threading
import subprocess
from flask import Flask, request, jsonify
import requests

# --- Configuration ---
CONFIG_PATH = 'agent_config.json'

# Default config
config = {
    'server_endpoint': 'http://127.0.0.1:8000/api/upload',
    'scan_interval': 3600,  # in seconds
    'port': 5000,
    'auth_token': 'default-token'
}

# Load config if exists
if os.path.exists(CONFIG_PATH):
    with open(CONFIG_PATH, 'r') as f:
        config.update(json.load(f))

OSQUERY_PATH = r'C:\Tools\osquery\osqueryi.exe'

QUERIES = {
    "os_version": "SELECT * FROM os_version;",
    "system_info": "SELECT * FROM system_info;",
    "memory_info": "SELECT * FROM memory_info;",
    "bios_info": "SELECT * FROM bios_info;",
    "cpu_info": "SELECT * FROM cpu_info;",
    "logical_drives": "SELECT * FROM logical_drives;",
    "installed_programs": "SELECT name, version, install_location FROM programs;"
}

app = Flask(__name__)


def run_osquery(query):
    try:
        result = subprocess.run(
            [OSQUERY_PATH, '--json', query],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"osquery error: {result.stderr}")
            return []
    except Exception as e:
        print(f"Exception running osquery: {e}")
        return []


def gather_data():
    data = {}
    for key, query in QUERIES.items():
        data[key] = run_osquery(query)
    return data


def send_data(data):
    try:
        headers = {'Authorization': f'Bearer {config["auth_token"]}'}
        response = requests.post(config['server_endpoint'], json=data, headers=headers)
        print(f"Data sent to server. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending data: {e}")


def periodic_scan():
    while True:
        print("Running scheduled scan...")
        data = gather_data()
        send_data(data)
        time.sleep(config['scan_interval'])


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running', 'config': config})


@app.route('/scan-now', methods=['POST'])
def scan_now():
    data = gather_data()
    send_data(data)
    return jsonify({'status': 'scan completed', 'data': data})


@app.route('/update-config', methods=['POST'])
def update_config():
    new_config = request.json
    config.update(new_config)
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=4)
    return jsonify({'status': 'config updated', 'config': config})


def start_agent():
    scan_thread = threading.Thread(target=periodic_scan, daemon=True)
    scan_thread.start()
    app.run(host='0.0.0.0', port=config['port'])


if __name__ == '__main__':
    start_agent()
