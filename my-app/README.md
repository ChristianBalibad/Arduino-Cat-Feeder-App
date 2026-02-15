# Cat Feeder App

React Native (Expo) app for monitoring and controlling an Arduino cat feeder.

## Supabase schema (low storage)

Sensors use **UPDATE** on one row each, not INSERT. Enables real-time and avoids storage growth.

1. Run `supabase/migrations/sensor_states.sql` in Supabase SQL Editor.
2. In Supabase: Database → Replication → enable `sensor_states` for Realtime.

## ESP instructions

**Live (every 30 sec):** PATCH `sensor_states` via Supabase REST API. `updated_at` auto-updates via trigger.

```
PATCH /rest/v1/sensor_states?sensor=eq.food_level
{"distance_cm": 5.2}

PATCH /rest/v1/sensor_states?sensor=eq.weight
{"weight_grams": 120.5}

PATCH /rest/v1/sensor_states?sensor=eq.motion
{"last_motion_at": "2025-02-15T12:00:00Z"}
```

**Daily history (once per day):** INSERT into `sensor_daily_log`:

```
POST /rest/v1/sensor_daily_log
{"sensor": "food_level", "log_date": "2025-02-15", "distance_cm": 5.2}
```

Use Supabase anon key in the `apikey` header and `Authorization: Bearer <anon_key>`.

## Dependencies

| Package | Purpose |
|---------|---------|
| expo | App framework, build tooling |
| react, react-dom, react-native | Core UI |
| react-native-web | Web platform support |
| @react-navigation/native | Navigation base |
| @react-navigation/bottom-tabs | Tab bar (Live, Feeding, Logs) |
| @react-navigation/drawer | Hamburger drawer menu |
| react-native-screens | Native screen containers |
| react-native-safe-area-context | Safe area insets |
| react-native-gesture-handler | Drawer gestures |
| react-native-reanimated | Drawer animations |
| @supabase/supabase-js | Backend, real-time data |
| expo-status-bar | Status bar styling |
| babel-preset-expo | Babel preset |

## Setup

1. Copy `lib/config.example.ts` to `lib/config.ts` and add Supabase credentials.
2. Run `npm install`
3. Run `npx expo start`
