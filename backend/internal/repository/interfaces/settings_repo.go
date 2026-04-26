package interfaces

import (
	"context"

	"github.com/rafif/healy-backend/internal/domain"
)

type SettingsRepository interface {
	GetByDeviceID(ctx context.Context, deviceID string) (domain.DeviceSettings, error)
	Upsert(ctx context.Context, settings domain.DeviceSettings) (domain.DeviceSettings, error)
}
