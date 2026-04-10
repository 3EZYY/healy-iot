#include "display_module.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void initDisplay() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.display();
}

void updateDisplay(float temp, int bpm, int spo2) {
  display.clearDisplay();
  
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Health Data:");
  
  display.setCursor(0, 20);
  display.print("Temp: ");
  display.print(temp);
  display.println(" C");

  display.setCursor(0, 35);
  display.print("BPM: ");
  display.println(bpm);

  display.setCursor(0, 50);
  display.print("SpO2: ");
  display.print(spo2);
  display.println(" %");

  display.display();
}
