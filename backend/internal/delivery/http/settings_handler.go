package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rafif/healy-backend/internal/domain"
	"github.com/rafif/healy-backend/internal/repository/interfaces"
)

// ThresholdSettingsDTO is the JSON shape the frontend expects.
// It bridges the DB's 4 columns with the frontend's 5 fields:
//
//	Frontend Field      ←  DB Column / Derivation
//	─────────────────────────────────────────────
//	temp_normal_min     ←  36.1 (physiological constant)
//	temp_normal_max     ←  temp_warn_max  (upper bound of NORMAL)
//	temp_warn_max       ←  temp_crit_max  (upper bound of WARNING)
//	spo2_normal_min     ←  spo2_warn_min  (lower bound of NORMAL)
//	spo2_warn_min       ←  spo2_crit_min  (lower bound of WARNING)
type ThresholdSettingsDTO struct {
	TempNormalMin float64 `json:"temp_normal_min"`
	TempNormalMax float64 `json:"temp_normal_max"`
	TempWarnMax   float64 `json:"temp_warn_max"`
	SpO2NormalMin int     `json:"spo2_normal_min"`
	SpO2WarnMin   int     `json:"spo2_warn_min"`
}

const tempNormalMinConst = 36.1

// toDTO converts a domain.DeviceSettings to the frontend-expected DTO.
func toDTO(s domain.DeviceSettings) ThresholdSettingsDTO {
	return ThresholdSettingsDTO{
		TempNormalMin: tempNormalMinConst,
		TempNormalMax: s.TempWarnMax,
		TempWarnMax:   s.TempCritMax,
		SpO2NormalMin: s.SpO2WarnMin,
		SpO2WarnMin:   s.SpO2CritMin,
	}
}

// fromDTO converts the frontend DTO back to a domain.DeviceSettings.
func fromDTO(dto ThresholdSettingsDTO, deviceID string) domain.DeviceSettings {
	return domain.DeviceSettings{
		DeviceID:    deviceID,
		TempWarnMax: dto.TempNormalMax,
		TempCritMax: dto.TempWarnMax,
		SpO2WarnMin: dto.SpO2NormalMin,
		SpO2CritMin: dto.SpO2WarnMin,
	}
}

// SettingsHandler handles GET and PUT for /api/settings/threshold.
type SettingsHandler struct {
	repo interfaces.SettingsRepository
}

// NewSettingsHandler creates a new SettingsHandler.
func NewSettingsHandler(repo interfaces.SettingsRepository) *SettingsHandler {
	return &SettingsHandler{repo: repo}
}

// GetThreshold handles GET /api/settings/threshold
// Returns the ThresholdSettingsDTO matching the frontend interface.
func (h *SettingsHandler) GetThreshold(c *gin.Context) {
	// Default device ID for the single-device MVP.
	// In a multi-device future, extract from query param or JWT context.
	deviceID := c.DefaultQuery("device_id", "healy-001")

	settings, err := h.repo.GetByDeviceID(c.Request.Context(), deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, toDTO(settings))
}

// UpdateThreshold handles PUT /api/settings/threshold
// Accepts the ThresholdSettingsDTO from the frontend and persists it.
func (h *SettingsHandler) UpdateThreshold(c *gin.Context) {
	var dto ThresholdSettingsDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deviceID := c.DefaultQuery("device_id", "healy-001")
	domainSettings := fromDTO(dto, deviceID)

	saved, err := h.repo.Upsert(c.Request.Context(), domainSettings)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, toDTO(saved))
}
