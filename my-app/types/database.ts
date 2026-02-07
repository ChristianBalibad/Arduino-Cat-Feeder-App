export interface FeedingEvent {
  id: string;
  created_at: string;
  portions: number;
}

export interface WeightReading {
  id: string;
  created_at: string;
  weight_grams: number;
}

export interface FoodLevelReading {
  id: string;
  created_at: string;
  distance_cm: number;
}

export interface MotionEvent {
  id: string;
  created_at: string;
}
