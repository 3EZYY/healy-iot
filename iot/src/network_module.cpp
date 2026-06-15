#include "network_module.h"
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <string.h>

// Cloudflare Tunnel endpoint. TLS di-terminate di edge Cloudflare (cert valid),
// library ESP32 otomatis setInsecure() saat tanpa fingerprint → tidak perlu CA bundle.
const char* websocket_host = "api.healy-observer.my.id";
const uint16_t websocket_port = 443;

WebSocketsClient webSocket;
const char* currentSsid;
const char* currentPassword;

bool isWsConnected = false;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      if (isWsConnected) {
        Serial.println("[WSc] Disconnected!");
        isWsConnected = false;
      }
      break;

    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      isWsConnected = true;
      break;

    case WStype_TEXT:
      // Jalur ini hanya untuk telemetri (uplink). Audio voice-assistant kini
      // diproses di browser, jadi tidak ada lagi perintah start/stop audio.
      Serial.printf("[WSc] text: %s\n", payload);
      break;

    case WStype_ERROR:
      Serial.println("[WSc] Error!");
      break;

    default:
      break;
  }
}

unsigned long lastWiFiConnectAttempt = 0;

void connectWiFi(const char* ssid, const char* password) {
  currentSsid = ssid;
  currentPassword = password;

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected.");
  } else {
    Serial.println("\nWiFi connection failed initially. Will retry in background.");
  }
}

// Gunakan parameter const char* path (misalnya "/ws/device") saat pemanggilan di main.cpp
void initWebSocket(const char* host, uint16_t port, const char* path) {
  // WSS via Cloudflare Tunnel. Library defaultnya kirim "Origin: file://" yang diblok CORS.
  // Override ke origin yang valid dan sertakan x-api-key untuk autentikasi device.
  webSocket.setExtraHeaders("Origin: https://healy-observer.my.id");
  webSocket.beginSSL(websocket_host, websocket_port, path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void sendTelemetry(const char* jsonPayload) {
  webSocket.sendTXT(jsonPayload);
}

void networkLoop() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastWiFiConnectAttempt >= 10000) {
      Serial.println("WiFi disconnected, reconnecting...");
      WiFi.begin(currentSsid, currentPassword);
      lastWiFiConnectAttempt = currentMillis;
    }
  } else {
    webSocket.loop();
  }
}
