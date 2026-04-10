#include <Arduino.h>
#include "sensor_module.h"
#include "display_module.h"

unsigned long previousMillis = 0;
const long interval = 1000;

void setup() {
  // Initialize Serial Monitor if debugging is needed
  Serial.begin(115200);

  initSensors();
  initDisplay();
}

void loop() {
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    float temp = getTemperature();
    int bpm = getBPM();
    int spo2 = getSpO2();
    
    updateDisplay(temp, bpm, spo2);
  }
}