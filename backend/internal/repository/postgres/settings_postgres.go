package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafif/healy-backend/internal/domain"
	"github.com/rafif/healy-backend/internal/repository/interfaces"
)

type settingsRepository struct {
	pool *pgxpool.Pool
}

// NewSettingsRepository creates a new instance of SettingsRepository.
func NewSettingsRepository(pool *pgxpool.Pool) interfaces.SettingsRepository {
	return &settingsRepository{
		pool: pool,
	}
}

// GetByDeviceID retrieves device settings by device_id.
// If no row exists, it returns the default settings.
func (r *settingsRepository) GetByDeviceID(ctx context.Context, deviceID string) (domain.DeviceSettings, error) {
	const query = `
		SELECT device_id, temp_warn_max, temp_crit_max, spo2_warn_min, spo2_crit_min, updated_at
		FROM public.device_settings
		WHERE device_id = $1
	`

	var s domain.DeviceSettings
	err := r.pool.QueryRow(ctx, query, deviceID).Scan(
		&s.DeviceID,
		&s.TempWarnMax,
		&s.TempCritMax,
		&s.SpO2WarnMin,
		&s.SpO2CritMin,
		&s.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			// Return defaults if no custom settings exist
			return domain.DefaultSettings(deviceID), nil
		}
		return domain.DeviceSettings{}, fmt.Errorf("failed to query device settings: %w", err)
	}

	return s, nil
}

// Upsert inserts or updates device settings using ON CONFLICT.
// Returns the persisted row.
func (r *settingsRepository) Upsert(ctx context.Context, settings domain.DeviceSettings) (domain.DeviceSettings, error) {
	const query = `
		INSERT INTO public.device_settings 
			(device_id, temp_warn_max, temp_crit_max, spo2_warn_min, spo2_crit_min, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (device_id)
		DO UPDATE SET
			temp_warn_max = EXCLUDED.temp_warn_max,
			temp_crit_max = EXCLUDED.temp_crit_max,
			spo2_warn_min = EXCLUDED.spo2_warn_min,
			spo2_crit_min = EXCLUDED.spo2_crit_min,
			updated_at    = NOW()
		RETURNING device_id, temp_warn_max, temp_crit_max, spo2_warn_min, spo2_crit_min, updated_at
	`

	var s domain.DeviceSettings
	err := r.pool.QueryRow(ctx, query,
		settings.DeviceID,
		settings.TempWarnMax,
		settings.TempCritMax,
		settings.SpO2WarnMin,
		settings.SpO2CritMin,
	).Scan(
		&s.DeviceID,
		&s.TempWarnMax,
		&s.TempCritMax,
		&s.SpO2WarnMin,
		&s.SpO2CritMin,
		&s.UpdatedAt,
	)
	if err != nil {
		return domain.DeviceSettings{}, fmt.Errorf("failed to upsert device settings: %w", err)
	}

	return s, nil
}
