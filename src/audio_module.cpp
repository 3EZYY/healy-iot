#include "audio_module.h"

#define I2S_WS 25
#define I2S_BCLK 26
#define I2S_DIN 23
#define I2S_SD 32

void initI2S() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 64,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_BCLK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_DIN,
    .data_in_num = I2S_SD
  };

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

void readMic(char* buffer, size_t bufferSize, size_t* bytesRead) {
  i2s_read(I2S_NUM_0, buffer, bufferSize, bytesRead, portMAX_DELAY);
}

void playAudio(const char* buffer, size_t bufferSize, size_t* bytesWritten) {
  i2s_write(I2S_NUM_0, buffer, bufferSize, bytesWritten, portMAX_DELAY);
}

void loopbackTest() {
  size_t bytesRead = 0;
  size_t bytesWritten = 0;
  char buffer[512];

  readMic(buffer, sizeof(buffer), &bytesRead);
  
  if (bytesRead > 0) {
    playAudio(buffer, bytesRead, &bytesWritten);
  }
}
