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

type Message struct {
	Type    string     `json:"type"`
	Token   string     `json:"token,omitempty"`
	Command string     `json:"command,omitempty"`
	Data    SystemInfo `json:"data,omitempty"`
}

const (
	configFile  = "system_config.json"
	wsServerURL = "ws://localhost:8000/ws/agent"
	staticToken = __STATIC_TOKEN__
)

func main() {
	if runtime.GOOS != "windows" {
		log.Fatal("Windows only")
	}

	for {
		connectAndRun()
		time.Sleep(10 * time.Second)
	}
}

func connectAndRun() {
	log.Println("Connecting to backend...")

	ws, err := websocket.Dial(wsServerURL, "", "http://localhost/")
	if err != nil {
		log.Printf("Connection failed: %v", err)
		return
	}
	defer ws.Close()

	log.Println("Connected")

	var raw string
	err = websocket.Message.Receive(ws, &raw)
	if err != nil {
		log.Printf("Auth request failed: %v", err)
		return
	}

	var serverMsg Message
	json.Unmarshal([]byte(raw), &serverMsg)

	if serverMsg.Type != "AUTH_REQUEST" {
		log.Println("Invalid auth sequence")
		return
	}

	authResp := Message{
		Type:  "AUTH_RESPONSE",
		Token: staticToken,
	}

	data, _ := json.Marshal(authResp)
	websocket.Message.Send(ws, string(data))

	err = websocket.Message.Receive(ws, &raw)
	if err != nil {
		log.Printf("Auth confirmation failed: %v", err)
		return
	}

	json.Unmarshal([]byte(raw), &serverMsg)

	if serverMsg.Type != "AUTH_OK" {
		log.Println("Authentication rejected")
		return
	}

	log.Println("Authenticated")

	go heartbeat(ws)

	for {
		err := websocket.Message.Receive(ws, &raw)
		if err != nil {
			log.Printf("Disconnected: %v", err)
			return
		}

		var msg Message
		json.Unmarshal([]byte(raw), &msg)

		log.Printf("Received: %s", msg.Type)

		if msg.Type == "COMMAND" {
			handleCommand(ws, msg.Command)
		}
	}
}

func heartbeat(ws *websocket.Conn) {
	for {
		msg := Message{
			Type: "HEARTBEAT",
		}

		data, _ := json.Marshal(msg)
		websocket.Message.Send(ws, string(data))

		time.Sleep(30 * time.Second)
	}
}

func handleCommand(ws *websocket.Conn, cmd string) {
	switch cmd {
	case "COLLECT_INFO":
		info := collectSystemInfo()

		payload := Message{
			Type: "TELEMETRY",
			Data: info,
		}

		data, _ := json.Marshal(payload)
		websocket.Message.Send(ws, string(data))
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

		return fmt.Sprintf("%.2f GB", toGB(line))
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
		return
	}

	os.WriteFile(configFile, data, 0644)
}
