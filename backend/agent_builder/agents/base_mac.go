//go:build darwin
// +build darwin

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

type Message struct {
	Type    string     `json:"type"`
	Token   string     `json:"token,omitempty"`
	Command string     `json:"command,omitempty"`
	Data    SystemInfo `json:"data,omitempty"`
}

const (
	staticToken = __STATIC_TOKEN__
	configFile  = "system_config.json"
	wsServerURL = "ws://localhost:8000/ws/agent"
)

func main() {
	if runtime.GOOS != "darwin" {
		log.Fatal("macOS only")
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

	var raw string

	err = websocket.Message.Receive(ws, &raw)
	if err != nil {
		log.Printf("Auth request failed: %v", err)
		return
	}

	var msg Message
	json.Unmarshal([]byte(raw), &msg)

	if msg.Type != "AUTH_REQUEST" {
		log.Println("Invalid auth flow")
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
		log.Printf("Auth response failed: %v", err)
		return
	}

	json.Unmarshal([]byte(raw), &msg)

	if msg.Type != "AUTH_OK" {
		log.Println("Authentication failed")
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

		json.Unmarshal([]byte(raw), &msg)

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
		BootTime:      getBootTime(),
		TotalMemory:   getTotalMemory(),
		SystemSummary: getSystemSummary(),
		InstalledApps: getInstalledSoftware(),
	}

	saveToFile(info)
	return info
}

func getSystemSummary() string {
	return runCommand("uname", "-a") + "\n" + runCommand("sw_vers")
}

func getInstalledSoftware() []string {
	output := runCommand("brew", "list", "--versions")

	if strings.TrimSpace(output) == "" {
		output = runCommand("system_profiler", "SPApplicationsDataType")
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

			if ip != "127.0.0.1" &&
				!strings.HasPrefix(ip, "169.") &&
				!strings.Contains(ip, ":") {
				ips = append(ips, ip)
			}
		}
	}

	return ips
}

func getBootTime() string {
	return strings.TrimSpace(
		runCommand("sysctl", "-n", "kern.boottime"),
	)
}

func getTotalMemory() string {
	output := runCommand("sysctl", "-n", "hw.memsize")

	var bytes int64
	fmt.Sscanf(output, "%d", &bytes)

	return fmt.Sprintf("%.2f GB", float64(bytes)/1024/1024/1024)
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
}
