//go:build linux
// +build linux

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"os/user"
	"runtime"
	"strings"
	"time"

	"golang.org/x/net/websocket"
)

type SystemInfo struct {
	Hostname      string   `json:"hostname"`
	OS            string   `json:"os"`
	Architecture  string   `json:"architecture"`
	User          string   `json:"user"`
	IPAddresses   []string `json:"ip_addresses"`
	BootTime      string   `json:"boot_time"`
	TotalMemory   string   `json:"total_memory"`
	SystemSummary string   `json:"system_summary"`
	InstalledApps []string `json:"installed_software"`
}

const (
	staticToken = __STATIC_TOKEN__ // TOKEN PLACEHOLDER
	configFile  = "system_config.json"
	wsServerURL = "ws://localhost:8000/ws"
)

func main() {
	if runtime.GOOS != "linux" {
		log.Fatal("This agent is intended for Linux only.")
	}

	for {
		log.Println("Connecting to server...")
		ws, err := websocket.Dial(wsServerURL, "", "http://localhost/")
		if err != nil {
			log.Printf("Connection error: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}

		log.Println("Connected. Waiting for server command...")

		for {
			var cmd string
			err := websocket.Message.Receive(ws, &cmd)
			if err != nil {
				log.Printf("Disconnected or error: %v", err)
				break
			}

			log.Printf("Received command: %s", cmd)

			if cmd == "COLLECT_INFO" {
				info := collectSystemInfo()
				data, _ := json.Marshal(info)
				websocket.Message.Send(ws, string(data))
			}
		}
		ws.Close()
	}
}

func collectSystemInfo() SystemInfo {
	hostname, _ := os.Hostname()
	usr, _ := user.Current()

	return SystemInfo{
		Hostname:      hostname,
		OS:            runtime.GOOS,
		Architecture:  runtime.GOARCH,
		User:          usr.Username,
		IPAddresses:   getIPAddresses(),
		BootTime:      getBootTime(),
		TotalMemory:   getTotalMemory(),
		SystemSummary: getSystemSummary(),
		InstalledApps: getInstalledSoftware(),
	}
}

func getSystemSummary() string {
	return runCommand("uname", "-a") + "\n" + runCommand("lsb_release", "-a")
}

func getInstalledSoftware() []string {
	output := runCommand("dpkg", "-l")
	if strings.Contains(output, "command not found") || strings.TrimSpace(output) == "" {
		output = runCommand("rpm", "-qa")
	}
	return strings.Split(output, "\n")
}

func getIPAddresses() []string {
	var ips []string
	ifaces, err := net.Interfaces()
	if err != nil {
		return ips
	}
	for _, iface := range ifaces {
		addrs, _ := iface.Addrs()
		for _, addr := range addrs {
			ip := strings.Split(addr.String(), "/")[0]
			if ip != "127.0.0.1" && !strings.HasPrefix(ip, "169.") {
				ips = append(ips, ip)
			}
		}
	}
	return ips
}

func getBootTime() string {
	output := runCommand("uptime", "-s")
	return strings.TrimSpace(output)
}

func getTotalMemory() string {
	output := runCommand("grep", "MemTotal", "/proc/meminfo")
	fields := strings.Fields(output)
	if len(fields) >= 2 {
		kb := 0
		fmt.Sscanf(fields[1], "%d", &kb)
		return fmt.Sprintf("%.2f GB", float64(kb)/1024/1024)
	}
	return ""
}

func runCommand(name string, args ...string) string {
	cmd := exec.Command(name, args...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Sprintf("Error running %s: %v", name, err)
	}
	return string(out)
}

func saveToFile(info SystemInfo) {
	data, _ := json.MarshalIndent(info, "", "  ")
	os.WriteFile(configFile, data, 0644)
	log.Printf("System info saved to %s", configFile)
}
