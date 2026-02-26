# Cat Feeder App Setup Guide

Simple steps to connect the app, Supabase, and your ESP.

---

## Step 1: App config

Copy the example file:

```
lib/config.example.ts  →  lib/config.ts
```

Open `lib/config.ts` and paste your Supabase values:

```ts
const config = {
  supabaseUrl: 'https://abcdefgh.supabase.co',
  supabasePublishableKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MjAwMDAsImV4cCI6MjAyNTM5NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};
```

**Where to get these:** Supabase Dashboard → Project Settings → API → Project URL and anon public key.

---

## Step 2: Supabase setup

### Create project

1. Go to supabase.com and sign in
2. New project → pick a name → Create

### Create tables

1. Click **SQL Editor** in the left menu
2. Click **New query**
3. Paste the contents of `supabase/migrations/sensor_states.sql`
4. Click **Run**
5. New query again, paste `supabase/migrations/feed_commands.sql`, Run

### Turn on realtime

In SQL Editor, run:

```sql
alter publication supabase_realtime add table sensor_states;
alter publication supabase_realtime add table feeding_events;
```

---

## Step 3: ESP setup

### Save these on the ESP

Get from Supabase → Project Settings → API:

```
SUPABASE_URL = "https://abcdefgh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIs..."
```

### Headers for every request

```
apikey: (your SUPABASE_KEY)
Authorization: Bearer (your SUPABASE_KEY)
Content-Type: application/json
```

---

## Step 4: What the ESP sends

All requests: add headers `apikey`, `Authorization: Bearer (key)`, `Content-Type: application/json`.

| When | Method | URL | Body |
|------|--------|-----|------|
| Every 5–10s | PATCH | `{URL}/rest/v1/sensor_states?sensor=eq.food_level` | `{"distance_cm": 8.5}` |
| Every 5–10s | PATCH | `{URL}/rest/v1/sensor_states?sensor=eq.weight` | `{"weight_grams": 95.2}` |
| When PIR detects | PATCH | `{URL}/rest/v1/sensor_states?sensor=eq.motion` | `{"last_motion_at": "2025-02-15T14:30:00Z"}` |
| Every few sec | GET | `{URL}/rest/v1/feed_commands?limit=1` | — |
| When feeder runs | POST | `{URL}/rest/v1/feeding_events` | `{"portions": 1}` |
| After feeder runs | DELETE | `{URL}/rest/v1/feed_commands?id=eq.{id}` | — |

**Feed flow:** GET feed_commands → if row exists, run servo → DELETE that row → POST to feeding_events.

---

### Examples (assuming SUPABASE_URL and SUPABASE_KEY are set)

**1. Food level (ultrasonic distance in cm)** – send every 5–10 seconds for snappier app updates:

```http
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.food_level
apikey: eyJhbGciOiJIUzI1NiIs...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{"distance_cm": 8.5}
```

```cpp
// Arduino/ESP32 - every 5-10 seconds for responsive app updates
float distanceCm = readUltrasonic();  // your sensor
String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.food_level";
http.addHeader("apikey", SUPABASE_KEY);
http.addHeader("Authorization", "Bearer " + SUPABASE_KEY);
http.addHeader("Content-Type", "application/json");
http.PATCH(url, "{\"distance_cm\":" + String(distanceCm, 1) + "}");
```

**2. Bowl weight (grams):**
```http
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.weight

{"weight_grams": 95.2}
```

```cpp
float grams = readScale();  // your load cell
String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.weight";
String body = "{\"weight_grams\":" + String(grams, 1) + "}";
http.PATCH(url, body);
```

**3. PIR motion (when detected):**
```http
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.motion

{"last_motion_at": "2025-02-15T14:30:00Z"}
```

```cpp
void onPIRTriggered() {
  String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.motion";
  String iso = getISOTimestamp();  // e.g. from NTP or RTC
  String body = "{\"last_motion_at\":\"" + iso + "\"}";
  http.PATCH(url, body);
}
```

**4. Feed command (poll, then run feeder):**
```cpp
void checkFeedCommand() {
  String url = SUPABASE_URL + "/rest/v1/feed_commands?order=created_at.asc&limit=1";
  int code = http.GET(url);
  if (code != 200) return;
  
  String json = http.getString();
  // Parse json: get first row's "id" and "portions"
  if (hasRows(json)) {
    String cmdId = parseId(json);
    int portions = parsePortions(json);
    runFeeder(portions);
    
    String delUrl = SUPABASE_URL + "/rest/v1/feed_commands?id=eq." + cmdId;
    http.DELETE(delUrl);
    
    String postUrl = SUPABASE_URL + "/rest/v1/feeding_events";
    http.POST(postUrl, "{\"portions\":" + String(portions) + "}");
  }
}
```

---

## Step 5: Daily log (optional)

Once per day, POST a snapshot for the Logs tab.

```http
POST https://abcdefgh.supabase.co/rest/v1/sensor_daily_log

{"sensor": "food_level", "log_date": "2025-02-15", "distance_cm": 8.5}
```

```cpp
// Call once per day (e.g. at midnight)
void sendDailyLog() {
  String date = getDateString();  // "2025-02-15"
  float dist = readUltrasonic();
  String body = "{\"sensor\":\"food_level\",\"log_date\":\"" + date + "\",\"distance_cm\":" + String(dist, 1) + "}";
  http.POST(SUPABASE_URL + "/rest/v1/sensor_daily_log", body);
}
```

For weight: `{"sensor": "weight", "log_date": "2025-02-15", "weight_grams": 95.2}`  
For motion: `{"sensor": "motion", "log_date": "2025-02-15", "motion_count": 12}`

---

## Quick checklist

| Step | Where | What |
|------|-------|-----|
| 1 | `lib/config.ts` | Add supabaseUrl and supabasePublishableKey |
| 2 | Supabase SQL Editor | Run sensor_states.sql, feed_commands.sql |
| 2 | Supabase SQL Editor | Run `alter publication supabase_realtime add table sensor_states` and `add table feeding_events` |
| 3 | ESP code | Save SUPABASE_URL and SUPABASE_KEY |
| 4 | ESP loop | PATCH food_level every 5–10s |
| 4 | ESP loop | PATCH weight every 5–10s |
| 4 | ESP (PIR callback) | PATCH motion when detected |
| 4 | ESP loop | Poll feed_commands, run feeder, delete, POST feeding_events |