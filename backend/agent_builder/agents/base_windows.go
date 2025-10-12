//go:build windows
// +build windows

package main

import (
	"encoding/json"
	"fmt"
	"log"
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
	configFile  = "system_config.json"
	wsServerURL = "ws://localhost:8000/ws"
	staticToken = __STATIC_TOKEN__ // 👈 placeholder for backend to inject
)

func main() {
	if runtime.GOOS != "windows" {
		log.Fatal("This version of agent is Windows-specific.")
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

				payload := map[string]interface{}{
					"token": staticToken, // 👈 send token with data
					"data":  info,
				}

				data, _ := json.Marshal(payload)
				websocket.Message.Send(ws, string(data))
			}
		}
		ws.Close()
	}
}

func collectSystemInfo() SystemInfo {
	hostname, _ := os.Hostname()
	usr, _ := user.Current()

	info := SystemInfo{
		Hostname:      hostname,
		OS:            runtime.GOOS,
		Architecture:  runtime.GOARCH,
		User:          usr.Username,
		IPAddresses:   getIPAddresses(),
		BootTime:      extractBootTime(),
		TotalMemory:   extractTotalMemory(),
		SystemSummary: runCommand("systeminfo"),
		InstalledApps: getInstalledSoftware(),
	}

	saveToFile(info)
	return info
}

func getInstalledSoftware() []string {
	output := runCommand("wmic", "product", "get", "name,version,installlocation")
	lines := strings.Split(output, "\n")
	var softwareList []string
	for _, line := range lines {
		cleaned := strings.TrimSpace(line)
		if cleaned != "" {
			softwareList = append(softwareList, cleaned)
		}
	}
	return softwareList
}

func getIPAddresses() []string {
	psCmd := `Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress`
	output := runCommand("powershell", "-Command", psCmd)
	lines := strings.Split(output, "\n")
	var ips []string
	for _, ip := range lines {
		ip = strings.TrimSpace(ip)
		if ip != "" && !strings.Contains(ip, "Error") {
			ips = append(ips, ip)
		}
	}
	return ips
}

func extractBootTime() string {
	output := runCommand("systeminfo")
	lines := strings.Split(output, "\n")
	for _, line := range lines {
		if strings.Contains(line, "System Boot Time") || strings.Contains(line, "System Up Time") {
			return strings.TrimSpace(strings.SplitN(line, ":", 2)[1])
		}
	}
	return ""
}

func extractTotalMemory() string {
	output := runCommand("wmic", "computersystem", "get", "TotalPhysicalMemory")
	lines := strings.Split(output, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "TotalPhysicalMemory") || line == "" {
			continue
		}
		bytesStr := strings.TrimSpace(line)
		if bytesStr != "" {
			return fmt.Sprintf("%.2f GB", toGB(bytesStr))
		}
	}
	return ""
}

func toGB(bytesStr string) float64 {
	var bytes float64
	fmt.Sscanf(bytesStr, "%f", &bytes)
	return bytes / (1024 * 1024 * 1024)
}

func runCommand(name string, args ...string) string {
	cmd := exec.Command(name, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Sprintf("Error running %s: %v", name, err)
	}
	return string(output)
}

func saveToFile(info SystemInfo) {
	data, err := json.MarshalIndent(info, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal JSON: %v", err)
		return
	}

	err = os.WriteFile(configFile, data, 0644)
	if err != nil {
		log.Printf("Failed to write config file: %v", err)
	} else {
		log.Printf("System info saved to %s", configFile)
	}
}
