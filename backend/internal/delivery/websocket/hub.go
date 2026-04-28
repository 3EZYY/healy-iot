package websocket

import (
	"encoding/json"
	"log"
)

// SystemMessage is a non-telemetry message sent from Hub to Frontend
type SystemMessage struct {
	Type   string `json:"type"`   // always "system"
	Status string `json:"status"` // "device_connected" | "device_disconnected"
}

// Hub maintains the set of active clients and broadcasts messages to the viewer clients.
type Hub struct {
	// Registered viewer clients (e.g., Frontend).
	viewerClients map[*Client]bool

	// Registered device clients (e.g., ESP32).
	deviceClients map[*Client]bool

	// Inbound messages to broadcast to viewer clients.
	Broadcast chan []byte

	// Register requests from the clients.
	RegisterViewer chan *Client
	RegisterDevice chan *Client

	// Unregister requests from clients.
	UnregisterViewer chan *Client
	UnregisterDevice chan *Client
}

func NewHub() *Hub {
	return &Hub{
		viewerClients:    make(map[*Client]bool),
		deviceClients:    make(map[*Client]bool),
		Broadcast:        make(chan []byte, 256),
		RegisterViewer:   make(chan *Client),
		UnregisterViewer: make(chan *Client),
		RegisterDevice:   make(chan *Client),
		UnregisterDevice: make(chan *Client),
	}
}

func (h *Hub) broadcastSystem(status string) {
	msg := SystemMessage{Type: "system", Status: status}
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling system message: %v\n", err)
		return
	}
	// Send to all viewer clients
	for client := range h.viewerClients {
		select {
		case client.send <- data:
		default:
			close(client.send)
			delete(h.viewerClients, client)
		}
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.RegisterViewer:
			h.viewerClients[client] = true
			log.Println("Viewer client registered")
			// Send current device status to the newly connected viewer
			if len(h.deviceClients) > 0 {
				h.broadcastSystem("device_connected")
			}

		case client := <-h.UnregisterViewer:
			if _, ok := h.viewerClients[client]; ok {
				delete(h.viewerClients, client)
				close(client.send)
				log.Println("Viewer client unregistered")
			}

		case client := <-h.RegisterDevice:
			h.deviceClients[client] = true
			log.Printf("Device client registered: %s\n", client.DeviceID)
			// Broadcast to all viewers: ESP32 is online
			h.broadcastSystem("device_connected")

		case client := <-h.UnregisterDevice:
			if _, ok := h.deviceClients[client]; ok {
				delete(h.deviceClients, client)
				close(client.send)
				log.Printf("Device client unregistered: %s\n", client.DeviceID)
			}
			// Broadcast to all viewers: ESP32 offline if no devices left
			if len(h.deviceClients) == 0 {
				h.broadcastSystem("device_disconnected")
			}

		case message := <-h.Broadcast:
			// Forward telemetry data to all viewer clients
			for client := range h.viewerClients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.viewerClients, client)
				}
			}
		}
	}
}
