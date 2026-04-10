#include <Arduino.h>
#include "audio_module.h"

void setup() {
  // Initialize Serial Monitor if debugging is needed
  Serial.begin(115200);

  // Call the I2S initialization function to start the audio drivers
  initI2S();
}

void loop() {
  // Continuously route microphone input directly to the speaker output
  loopbackTest();
}