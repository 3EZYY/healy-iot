#ifndef NETWORK_MODULE_H
#define NETWORK_MODULE_H

#include <Arduino.h>

void connectWiFi(const char* ssid, const char* password);
void initWebSocket(const char* host, uint16_t port, const char* path);
void sendTelemetry(String jsonPayload);
void networkLoop();

#endif
