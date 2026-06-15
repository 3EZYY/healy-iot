#include <Arduino.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/queue.h>
#include "sensor_module.h"
#include "display_module.h"
#include "network_module.h"

#define TELEMETRY_QUEUE_LEN  5
#define JSON_BUF_SIZE        128

typedef struct {
  char json[JSON_BUF_SIZE];
} TelemetryMsg_t;

static QueueHandle_t telemetryQueue;

// Core 1: non-blocking MAX30102 poll at ~200Hz; display + telemetry queued every 1s
static void sensorDisplayTask(void* pvParameters) {
  TickType_t lastDisplayTick = xTaskGetTickCount();
  const TickType_t displayInterval = pdMS_TO_TICKS(1000);

  for (;;) {
    updateSensors();  // drains MAX30102 FIFO — non-blocking

    if ((xTaskGetTickCount() - lastDisplayTick) >= displayInterval) {
      lastDisplayTick += displayInterval;  // drift-free 1s cadence

      float temp = getTemperature();  // MLX90614 I2C read
      int   bpm  = getBPM();
      int   spo2 = getSpO2();

      updateDisplay(temp, bpm, spo2, isFingerPresent(), isAdjustNeeded());  // SSD1306 I2C update

      TelemetryMsg_t msg;
      JsonDocument doc;
      doc["temp"]   = temp;
      doc["bpm"]    = bpm;
      doc["spo2"]   = spo2;
      doc["status"] = "online";
      serializeJson(doc, msg.json, JSON_BUF_SIZE);
      xQueueSend(telemetryQueue, &msg, 0);  // non-blocking enqueue
    }

    vTaskDelay(pdMS_TO_TICKS(5));
  }
}


// Core 0: handle WiFi/WebSocket lifecycle and ship queued telemetry frames.
static void networkTask(void* pvParameters) {
  TelemetryMsg_t msg;

  for (;;) {
    networkLoop();

    if (xQueueReceive(telemetryQueue, &msg, 0) == pdTRUE) {
      sendTelemetry(msg.json);
    }

    vTaskDelay(pdMS_TO_TICKS(5));
  }
}


void setup() {
  Serial.begin(115200);

  connectWiFi("ATAR ATAS", "ataratas123");
  initWebSocket(nullptr, 0, "/ws/device?device_id=healy-esp32");

  Wire.begin(21, 22);
  Wire.setClock(100000);  // Standard Mode (100kHz) — clone OLEDs are unstable at 400kHz

  Serial.println("Scanning I2C bus...");
  int deviceCount = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();
    if (error == 0) {
      Serial.printf("I2C device found at address 0x%02X\n", address);
      deviceCount++;
    }
  }
  if (deviceCount == 0) {
    Serial.println("No I2C devices found. Check wiring or hardware!");
  }

  initSensors();
  initDisplay();

  telemetryQueue = xQueueCreate(TELEMETRY_QUEUE_LEN, sizeof(TelemetryMsg_t));
  configASSERT(telemetryQueue);

  // Audio (mic + speaker) kini ditangani sepenuhnya oleh browser/laptop, jadi
  // device cukup menjalankan dua task: akuisisi sensor dan pengiriman telemetri.
  xTaskCreatePinnedToCore(sensorDisplayTask, "SensorDisplay", 8192, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(networkTask,       "Network",       8192, NULL, 1, NULL, 0);
}

void loop() {
  vTaskDelete(NULL);  // Arduino loop task deleted — all work is in FreeRTOS tasks above
}
