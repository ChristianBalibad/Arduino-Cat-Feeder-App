export interface FeedingEvent {
  id: string;
  created_at: string;
  portions: number;
}

export interface SensorState {
  sensor: string;
  distance_cm: number | null;
  weight_grams: number | null;
  last_motion_at: string | null;
  updated_at: string;
}

export interface SensorDailyLog {
  id: string;
  sensor: string;
  log_date: string;
  distance_cm: number | null;
  weight_grams: number | null;
  motion_count: number;
  created_at: string;
}
