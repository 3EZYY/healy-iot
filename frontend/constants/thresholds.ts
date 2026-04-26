// Threshold constants — mirrored from backend usecase/alert_usecase.go
export const THRESHOLDS = {
  temperature: {
    normalMin: 36.5,
    normalMax: 37.5,
    warnMax:   38.5,
  },
  spo2: {
    normalMin: 95,
    warnMin:   91,
  },
} as const;
