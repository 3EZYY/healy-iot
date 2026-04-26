package http

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rafif/healy-backend/internal/delivery/http/middleware"
	"github.com/rafif/healy-backend/internal/delivery/websocket"
	"github.com/rafif/healy-backend/internal/domain"
	"github.com/rafif/healy-backend/internal/repository/interfaces"
	"github.com/rafif/healy-backend/internal/usecase"
	"github.com/rafif/healy-backend/pkg/config"
	"github.com/rafif/healy-backend/pkg/jwt"
)

// SetupRouter creates and configures the Gin engine with all the routes.
// F-02 RESOLVED: JWT middleware now protects /api/telemetry, /api/settings, /api/device.
// F-04 RESOLVED: Settings handler bridges DB columns to frontend ThresholdSettings DTO.
func SetupRouter(
	cfg *config.Config,
	hub *websocket.Hub,
	telemetryUsecase usecase.TelemetryUsecase,
	authUsecase usecase.AuthUsecase,
	tokenGenerator jwt.TokenGenerator,
	telemetryRepo interfaces.TelemetryRepository,
	settingsRepo interfaces.SettingsRepository,
) *gin.Engine {
	r := gin.Default()

	// ── CORS Middleware ────────────────────────────────────────────
	// Membaca CORS_ALLOWED_ORIGINS dari config (sudah di-parse jadi []string).
	// Contoh nilai: ["http://localhost:3000", "https://healy.vercel.app"]
	// Referensi: HEALY_Master_Blueprint v2.1.0 Section 7.1 & 8.1
	r.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSAllowedOrigins,
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Length",
			"Content-Type",
			"Authorization",
			"device_id",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initialize handlers
	telemetryHandler := NewTelemetryHandler(telemetryRepo)
	settingsHandler := NewSettingsHandler(settingsRepo)

	api := r.Group("/api")
	{
		// ─── Public: Auth ───
		auth := api.Group("/auth")
		{
			auth.POST("/login", func(c *gin.Context) {
				var req domain.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}

				resp, err := authUsecase.Login(c.Request.Context(), req)
				if err != nil {
					c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
					return
				}

				c.JSON(http.StatusOK, resp)
			})
		}

		// ─── Protected: requires valid JWT ───
		// F-02: JWT middleware is now wired here
		protected := api.Group("/")
		protected.Use(middleware.JWTAuth(tokenGenerator))
		{
			// Telemetry endpoints — real handlers, no more TODOs
			telemetry := protected.Group("/telemetry")
			{
				telemetry.GET("/history", telemetryHandler.GetHistory)
				telemetry.GET("/latest", telemetryHandler.GetLatest)
			}

			// Settings endpoints — F-04: DTO bridge handles field mapping
			settings := protected.Group("/settings")
			{
				settings.GET("/threshold", settingsHandler.GetThreshold)
				settings.PUT("/threshold", settingsHandler.UpdateThreshold)
			}

			// Device status endpoint
			device := protected.Group("/device")
			{
				device.GET("/status", func(c *gin.Context) {
					// MVP: return connected status.
					// A full implementation would track device heartbeats via a thread-safe accessor.
					c.JSON(http.StatusOK, gin.H{
						"device_id": "healy-001",
						"is_online": true,
						"last_seen": "",
					})
				})
			}
		}
	}

	// WebSocket endpoints
	ws := r.Group("/ws")
	{
		ws.GET("/telemetry", func(c *gin.Context) {
			// JWT should ideally be validated here using token from query param
			// e.g. token := c.Query("token")
			websocket.ServeViewerWs(hub, c.Writer, c.Request)
		})

		ws.GET("/device", func(c *gin.Context) {
			// device_id is expected in header
			websocket.ServeDeviceWs(hub, telemetryUsecase, c.Writer, c.Request)
		})
	}

	return r
}
