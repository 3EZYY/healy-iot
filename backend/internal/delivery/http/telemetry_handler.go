package http

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rafif/healy-backend/internal/repository/interfaces"
)

// TelemetryHandler handles GET requests for telemetry data.
type TelemetryHandler struct {
	repo interfaces.TelemetryRepository
}

// NewTelemetryHandler creates a new TelemetryHandler.
func NewTelemetryHandler(repo interfaces.TelemetryRepository) *TelemetryHandler {
	return &TelemetryHandler{repo: repo}
}

// rangeMappings maps frontend range strings to hours for the DB query.
var rangeMappings = map[string]int{
	"1h":  1,
	"6h":  6,
	"24h": 24,
	"7d":  168, // 7 * 24
}

// GetHistory handles GET /api/telemetry/history?range=1h|6h|24h|7d
// Returns []domain.TelemetryRecord which json.Marshal produces as nested JSON
// matching the frontend TelemetryRecord interface (sensor.temperature, status.overall, etc.)
func (h *TelemetryHandler) GetHistory(c *gin.Context) {
	deviceID := c.DefaultQuery("device_id", "healy-001")
	rangeStr := c.DefaultQuery("range", "1h")

	hours, ok := rangeMappings[rangeStr]
	if !ok {
		// Fallback: try to parse as integer hours
		parsed, err := strconv.Atoi(rangeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid range, use 1h|6h|24h|7d"})
			return
		}
		hours = parsed
	}

	records, err := h.repo.GetHistory(c.Request.Context(), deviceID, hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// json.Marshal on []domain.TelemetryRecord produces the nested structure
	// the frontend expects: { sensor: {...}, status: {...}, timestamp: ... }
	c.JSON(http.StatusOK, records)
}

// GetLatest handles GET /api/telemetry/latest
// Returns the single most recent domain.TelemetryRecord.
func (h *TelemetryHandler) GetLatest(c *gin.Context) {
	deviceID := c.DefaultQuery("device_id", "healy-001")

	record, err := h.repo.GetLatest(c.Request.Context(), deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, record)
}
