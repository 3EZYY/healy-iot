#include "network_module.h"
#include <WiFi.h>
#include <WebSocketsClient.h>

WebSocketsClient webSocket;
const char* currentSsid;
const char* currentPassword;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected!");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      break;
    case WStype_ERROR:
      Serial.println("[WSc] Error!");
      break;
    default:
      break;
  }
}

void connectWiFi(const char* ssid, const char* password) {
  currentSsid = ssid;
  currentPassword = password;
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
}

void initWebSocket(const char* host, uint16_t port, const char* path) {
  webSocket.begin(host, port, path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void sendTelemetry(String jsonPayload) {
  webSocket.sendTXT(jsonPayload);
}

void networkLoop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    connectWiFi(currentSsid, currentPassword);
  }
  webSocket.loop();
}
