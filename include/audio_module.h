#ifndef AUDIO_MODULE_H
#define AUDIO_MODULE_H

#include <Arduino.h>
#include <driver/i2s.h>

void initI2S();
void readMic(char* buffer, size_t bufferSize, size_t* bytesRead);
void playAudio(const char* buffer, size_t bufferSize, size_t* bytesWritten);
void loopbackTest();

#endif
