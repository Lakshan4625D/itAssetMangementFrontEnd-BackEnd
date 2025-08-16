import asyncio
import platform
import socket
import uuid
import subprocess
import re
import ipaddress
import psutil
from pysnmp.hlapi.v3arch.asyncio import (
    SnmpEngine, CommunityData, UdpTransportTarget,
    ContextData, ObjectType, ObjectIdentity, get_cmd
)
import nmap
import requests
import mysql.connector
from datetime import datetime
import time
import xml.etree.ElementTree as ET

# Database configuration
DB_CONFIG = {
    'user': 'root',
    'password': 'root',
    'host': 'localhost',
    'database': 'network_scanner'
}

def get_active_interface_info():
    """
    Retrieve active network interface information.
    """
    system = platform.system()
    interfaces = psutil.net_if_addrs()
    stats = psutil.net_if_stats()

    for iface, addrs in interfaces.items():
        if iface == 'lo' or not stats[iface].isup:
            continue

        ipv4 = next((a.address for a in addrs if a.family == socket.AF_INET), None)
        mac = next((a.address for a in addrs if a.family == psutil.AF_LINK), None)

        if ipv4 and mac:
            info = {
                'Active Interface': iface,
                'IP Address': ipv4,
                'MAC Address': mac,
                'Interface Status': 'UP',
                'Connection Type': 'Wired/Wi-Fi'
            }

            wifi_details = get_wifi_details_by_os(system, iface)
            if wifi_details:
                info['Connection Type'] = 'WiFi'
                info['WiFi Details'] = wifi_details

            return info

    return None

def get_wifi_details_by_os(system, iface):
    """
    Retrieve connected WiFi details by OS.
    """
    try:
        if system == 'Windows':
            output = subprocess.check_output("netsh wlan show interfaces", shell=True, text=True, encoding='utf-8')
            if iface not in output:
                return None
            return {
                'SSID': re.search(r'SSID *: (.+)', output).group(1),
                'Signal': re.search(r'Signal *: (\d+)%', output).group(1) + '%',
                'Radio Type': re.search(r'Radio type *: (.+)', output).group(1),
                'Channel': re.search(r'Channel *: (\d+)', output).group(1),
                'Authentication': re.search(r'Authentication *: (.+)', output).group(1)
            }
        elif system == 'Linux':
            output = subprocess.check_output(["nmcli","-t","-f","active,ssid,signal,chan,security","dev","wifi"], text=True)
            for line in output.splitlines():
                if line.startswith("yes"):
                    _, ssid, signal, channel, auth = line.split(':')
                    return {
                        'SSID': ssid,
                        'Signal': signal + '%',
                        'Radio Type': 'Unknown',
                        'Channel': channel,
                        'Authentication': auth
                    }
        elif system == 'Darwin':
            airport_path = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
            output = subprocess.check_output([airport_path,"-I"], text=True)
            return {
                'SSID': re.search(r'\s*SSID: (.+)', output).group(1),
                'Signal': str(int(re.search(r'agrCtlRSSI: (-?\d+)', output).group(1))+100) + '%',
                'Radio Type': re.search(r'PHY Mode: (.+)', output).group(1),
                'Channel': re.search(r'channel: (\d+)', output).group(1),
                'Authentication': 'Unknown'
            }
    except Exception:
        return None

def get_network_range_from_ip(ip_address):
    """
    Calculate the network range (/24) from an IP address.
    """
    try:
        ip_obj = ipaddress.IPv4Address(ip_address)
        network = ipaddress.IPv4Network(f"{ip_obj}/24", strict=False)
        return str(network)
    except Exception:
        return None

async def get_snmp_info(ip, community='public'):
    """
    Retrieve SNMP information from a remote host.
    """
    oid_sysdescr = '1.3.6.1.2.1.1.1.0'
    oid_sysname = '1.3.6.1.2.1.1.5.0'
    info = {}
    snmpEngine = SnmpEngine()
    for oid, label in [(oid_sysdescr, "Description"), (oid_sysname, "Name")]:
        iterator = get_cmd(
            snmpEngine,
            CommunityData(community, mpModel=0),
            await UdpTransportTarget.create((str(ip), 161)),
            ContextData(), 
            ObjectType(ObjectIdentity(oid)),
        )
        errorIndication, errorStatus, errorIndex, varBinds = await iterator
        if errorIndication or errorStatus:
            info[label] = None
        else:
            for varBind in varBinds:
                info[label] = str(varBind[1])

    snmpEngine.close_dispatcher()
    return info if info.get("Description") else None

def reverse_dns_lookup(ip_address):
    try:
        hostname = socket.gethostbyaddr(ip_address)[0]
        return hostname
    except socket.herror:
        return ''  # if reverse DNS fails or there’s no DNS record

def get_my_ip():
    """Get the current machine's IP address."""
    return socket.gethostbyname(socket.gethostname())    

def get_my_mac():
    """Get the current machine's MAC address."""
    mac = uuid.getnode()
    mac_formatted = ':'.join(['{:02x}'.format((mac >> elements) & 0xff) for elements in range(40, -1, -8)]).upper()
    return mac_formatted

def nmap_scan(network_range):
    """
    Perform Nmap scan on the specified network range.
    """
    nm = nmap.PortScanner()
    print(f"Scanning network {network_range} with Nmap...\n")
    try:
        nm.scan(hosts=network_range, arguments='-O -T4')
    except Exception as e:
        print("Nmap scan failed.", e)
        return {}

    results = {}
    my_ip = get_my_ip()
    my_mac = get_my_mac()
    for host in nm.all_hosts():
        if nm[host].state() == 'up':
            hostname = reverse_dns_lookup(host)
            if not hostname:
             hostname = nm[host].hostname() or "Unknown"

            data = {
                "hostname":hostname,
                "os": nm[host]['osmatch'][0]['name'] if nm[host].get('osmatch') else "Unknown",
                "ports": [],
                "mac": nm[host]['addresses'].get('mac', 'Unknown'),
                "vendor": nm[host]['vendor'].get(nm[host]['addresses'].get('mac', ''), 'Unknown')
            }
            if host == my_ip:
                data["mac"] = my_mac
            if 'tcp' in nm[host]:
                for port in nm[host]['tcp']:
                    pinfo = nm[host]['tcp'][port]
                    data["ports"].append(f"{port}/{pinfo['state']} ({pinfo['name']})")
            results[host] = data
    return results

def is_randomized_mac(mac):
    """
    Check if MAC is a Locally administered or Randomized MAC.
    """
    try:
        parts = mac.split(':')
        if len(parts) == 6:
            first_byte = int(parts[0], 16)
            return (first_byte & 0x02) == 0x02
    except (ValueError, AttributeError):
        return False
    return False

def get_mac_vendor(mac_address):
    """
    Look up MAC address vendor info from macvendors.com API.
    """
    if not mac_address or mac_address.lower() == "unknown":
        return "MAC Address Unknown"

    if is_randomized_mac(mac_address):
        return "Locally Administered / Randomized MAC (Unknown)"

    mac_clean = mac_address.upper().replace(':', '') 
    mac_clean = mac_clean.replace('-', '') 
    mac_clean = mac_clean.replace('.', '') 
    url = f"https://api.macvendors.com/{mac_clean}"

    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
        if response.status_code == 200:
            return response.text
        elif response.status_code == 429:
            return "Rate limit exceeded. Try again later."
        else:
            return f"API Error: {response.status_code}"
    except requests.RequestException as e:
        return f"Request failed: {e}"

def identify_device_type(snmp_desc, nmap_os, ports, vendor):
    joined_info = f"{snmp_desc or ''} {nmap_os or ''} {vendor or ''}".lower()
    ports = [p.split('/')[0] for p in ports]  # extract port numbers only

    def match_any(keywords):
        return any(k in joined_info for k in keywords)

    def vendor_match(vendors):
        return vendor and any(v in vendor.lower() for v in vendors)

    # Router / Gateway
    if (match_any(['router', 'gateway', 'edge', 'firewall', 'broadband', 'cpe']) or 
        any(p in ports for p in ['53', '1900', '500', '4500', '1701', '80', '443', '8080', '8443'])) and \
       vendor_match(['arcadyan', 'cisco', 'd-link', 'tp-link', 'netgear', 'asus', 'zte', 'huawei']):
        return "Router"

    # Switch
    if match_any(['switch', 'catalyst', 'layer 2', 'layer 3', 'dell', 'juniper']) or \
       vendor_match(['cisco', 'juniper', 'dell', 'hp', 'netgear']):
        return "Switch"

    # Printer
    if match_any(['printer', 'hp', 'canon', 'epson', 'xerox']) or any(p in ports for p in ['515', '631', '9100', '9101']):
        return "Printer"

    # PC / Workstation
    if match_any(['windows', 'linux', 'ubuntu', 'mac', 'microsoft', 'desktop']) or \
       any(p in ports for p in ['22', '135', '139', '445', '3389']):
        return "PC"

    # IP Camera
    if match_any(['camera', 'hikvision', 'dahua', 'ip camera', 'axis']) or any(p in ports for p in ['554', '8080', '37777', '5000', '5001']):
        return "IP Camera"

    # Access Point
    if match_any(['access point', 'ap', 'aruba', 'unifi', 'wireless controller']) or \
       any(p in ports for p in ['80', '443', '161', '22']):
        return "Access Point"

    # VoIP Phone
    if match_any(['voip', 'sip', 'phone', 'polycom']) or any(p in ports for p in ['5060', '5061', '5062']):
        return "VoIP Phone"

    # NAS (Network Storage)
    if match_any(['nas', 'storage', 'synology', 'diskstation', 'qnap']) or any(p in ports for p in ['2049', '5000', '5001', '445', '139']):
        return "NAS (Network Storage)"

    # Firewall
    if match_any(['firewall', 'palo alto', 'fortigate', 'checkpoint', 'juniper']):
        return "Firewall"

    # Smart TV
    if match_any(['smart tv', 'samsung', 'lg', 'roku', 'android tv']) or any(p in ports for p in ['8008', '8009', '8443', '1935', '6970']):
        return "Smart TV"

    # IoT Device
    if match_any(['iot', 'smart plug', 'esp8266', 'tuya', 'espressif', 'zigbee']):
        return "IoT Device"

    # Game Console
    if match_any(['xbox', 'playstation', 'nintendo', 'game console']) or any(p in ports for p in ['3074', '3478', '3479', '3480']):
        return "Game Console"

    # Media Server
    if match_any(['plex', 'emby', 'jellyfin', 'media server']) or any(p in ports for p in ['32400', '8096', '9000']):
        return "Media Server"

    # Virtual Machine / Hypervisor
    if match_any(['vmware', 'virtualbox', 'qemu', 'kvm', 'virtual machine', 'hyper-v']) or \
       (vendor and 'vm' in vendor.lower()):
        return "Virtual Machine"

    return "Unknown"

def save_scan_to_db(interface_info, network_range, devices):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    scan_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Check if this network already exists
    cursor.execute("SELECT id FROM networks WHERE ip_range = %s AND interface = %s",
                   (network_range, interface_info['Active Interface']))
    row = cursor.fetchone()

    if row:
        network_id = row[0]
        # Update scan time
        cursor.execute("UPDATE networks SET scan_time = %s WHERE id = %s", (scan_time, network_id))
        # Clear old devices for this network
        cursor.execute("DELETE FROM devices WHERE network_id = %s", (network_id,))
    else:
        cursor.execute(
            "INSERT INTO networks (ip_range, interface, mac, scan_time) VALUES (%s, %s, %s, %s)", 
            (network_range, interface_info['Active Interface'], interface_info['MAC Address'], scan_time)
        )
        network_id = cursor.lastrowid

    for device in devices:
        cursor.execute(''' 
            INSERT INTO devices (
                network_id, ip, hostname, os, ports, mac, vendor, manufacturer,
                snmp_name, snmp_desc, device_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''',( 
            network_id, device['ip'], device['hostname'], device['os'], device['ports'], 
            device['mac'], device['vendor'], device['manufacturer'], 
            device['snmp_name'], device['snmp_desc'], device['device_type'] 
        ))    

    conn.commit()
    conn.close()
    print(f"✅ Scan saved: {len(devices)} device(s) stored.")


def discover_upnp_devices(timeout=15):
    """
    Discover UPnP/SSDP devices on the local network.
    """
    MCAST_GRP = '239.255.255.250'
    MCAST_PORT = 1900
    SSDP_DISCOVER_MSG = (
        'M-SEARCH * HTTP/1.1\r\n'
        f'HOST: {MCAST_GRP}:{MCAST_PORT}\r\n'
        'MAN: "ssdp:discover"\r\n'
        'MX: 2\r\n'
        'ST: ssdp:all\r\n\r\n'
    )

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.settimeout(timeout)
    sock.sendto(SSDP_DISCOVER_MSG.encode('utf-8'), (MCAST_GRP, MCAST_PORT))

    found_devices = set()

    print("Searching for UPnP/SSDP devices on the network...\n")

    start = time.time()
    while time.time() - start < timeout:
        try:
            data, addr = sock.recvfrom(1024)
            text = data.decode('utf-8', errors='ignore')
            location = None
            for line in text.splitlines():
                if line.lower().startswith("location:"):
                    location = line.split(":", 1)[1].strip()
                    break
            if location:
                found_devices.add((addr[0], location)) 
        except socket.timeout:
            break

    return list(found_devices)


def parse_device_description(url):
    """
    Retrieve and parse UPnP device details from its description XML.
    """
    try:
        response = requests.get(url, timeout=5)
        tree = ET.fromstring(response.content)
        ns = {"upnp": "urn:schemas-upnp-org:device-1-0"}
        device = tree.find('.//upnp:device', ns)

        if device is not None:
            return {
                "location": url,
                "friendly_name": device.findtext("upnp:friendlyName", default='N/A', namespaces=ns),
                "manufacturer": device.findtext("upnp:manufacturer", default='N/A', namespaces=ns),
                "model_name": device.findtext("upnp:modelName", default='N/A', namespaces=ns),
                "model_number": device.findtext("upnp:modelNumber", default='N/A', namespaces=ns),
                "serial_number": device.findtext("upnp:serialNumber", default='N/A', namespaces=ns),
                "device_type": device.findtext("upnp:deviceType", default='N/A', namespaces=ns)
            }
    except Exception as e:
        print("Failed to retrieve details.", e)
    return None

async def scan_network_combined():
    """
    Perform a complete network scan: Nmap, SNMP, SSDP/UPnP, then save results to DB.
    """
    interface_info = get_active_interface_info()
    if not interface_info:
        print("No active network interface detected.")
        return

    print("Active Interface :", interface_info['Active Interface'])

    print("IP Address       :", interface_info['IP Address'])

    print("MAC Address      :", interface_info['MAC Address'])

    print("Interface Status :", interface_info['Interface Status'])

    print("Connection Type  :", interface_info['Connection Type'])

    if 'WiFi Details' in interface_info:
        print("WiFi Details:")
        for k, v in interface_info['WiFi Details'].items():
            print(f"  {k}: {v}")

    print("\n")

    network_range = get_network_range_from_ip(interface_info['IP Address'])

    if not network_range:
        print("Could not determine network range from IP address.")
        return

    nmap_results = nmap_scan(network_range)
    print("Collecting SNMP info...\n")

    devices_to_store = []

    for ip in ipaddress.IPv4Network(network_range).hosts():
        ip_str = str(ip)
        if ip_str in nmap_results:
            snmp_data = await get_snmp_info(ip_str)
            desc = snmp_data.get('Description') if snmp_data else None
            os_detect = nmap_results[ip_str]['os']
            mac_address = nmap_results[ip_str]['mac']
            vendor = nmap_results[ip_str]['vendor']
            manufacturer = get_mac_vendor(mac_address)
            device_type = identify_device_type(desc, os_detect, nmap_results[ip_str]['ports'], vendor)

            devices_to_store.append({ 
                'ip': ip_str,
                'hostname': nmap_results[ip_str]['hostname'], 
                'os': os_detect,
                'ports': ', '.join(nmap_results[ip_str]['ports']),
                'mac': mac_address,
                'vendor': vendor,
                'manufacturer': manufacturer,
                'snmp_name': snmp_data.get('Name') if snmp_data else None,
                'snmp_desc': desc,
                'device_type': device_type
            })

    print("Scanning for UPnP/SSDP devices...")
    upnp_devices = discover_upnp_devices()
    print(f"SSDP found {len(upnp_devices)} device(s)")

    for ip, url in upnp_devices:
        details = parse_device_description(url)
        if details:
            ip = details['location'].split('/')[2].split(':')[0]
            matching = next((d for d in devices_to_store if d['ip'] == ip), None)
            if matching:
                matching['manufacturer'] = details['manufacturer']
                matching['hostname'] = details['friendly_name']

            else:
                devices_to_store.append({ 
                    'ip': ip,
                    'hostname': details['friendly_name'], 
                    'os': 'Unknown',
                    'ports': '',
                    'mac': '',
                    'vendor': '',
                    'manufacturer': details['manufacturer'], 
                    'snmp_name': details['friendly_name'], 
                    'snmp_desc': details['model_name'], 
                    'device_type': details['device_type']

                })
    save_scan_to_db(interface_info, network_range, devices_to_store)


if __name__ == "__main__":
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())    

    asyncio.run(scan_network_combined()) 


 