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

### Food level (every 30 seconds)

Send the distance from ultrasonic sensor in cm.

**Example request:**
```
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.food_level

Headers: apikey, Authorization, Content-Type
Body: {"distance_cm": 8.5}
```

**Arduino / ESP example:**
```cpp
// distance is from your ultrasonic (e.g. 8.5 cm)
String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.food_level";
http.PATCH(url, "application/json", "{\"distance_cm\":" + String(distance, 1) + "}");
```

---

### Bowl weight (every 30 seconds)

Send the weight in grams.

**Example request:**
```
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.weight

Body: {"weight_grams": 95.2}
```

**Arduino / ESP example:**
```cpp
// grams is from your load cell / scale
String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.weight";
String body = "{\"weight_grams\":" + String(grams, 1) + "}";
http.PATCH(url, "application/json", body);
```

---

### PIR motion (when cat is detected)

Update when the PIR sensor triggers.

**Example request:**
```
PATCH https://abcdefgh.supabase.co/rest/v1/sensor_states?sensor=eq.motion

Body: {"last_motion_at": "2025-02-15T14:30:00Z"}
```

**Arduino / ESP example:**
```cpp
// When PIR fires:
void onPIRDetected() {
  String url = SUPABASE_URL + "/rest/v1/sensor_states?sensor=eq.motion";
  String timestamp = "2025-02-15T14:30:00Z";  // or build from RTC/ntp
  String body = "{\"last_motion_at\":\"" + timestamp + "\"}";
  http.PATCH(url, "application/json", body);
}
```

---

### Feed command (check every few seconds)

1. Check if there is a feed command
2. If yes: run the feeder, delete the command, log the event

**Example:**
```
1. GET https://abcdefgh.supabase.co/rest/v1/feed_commands?limit=1

2. If you get a row:
   - Run servo for portions
   - DELETE that row (need the id)
   - POST to feeding_events with {"portions": 1}
```

**Arduino / ESP example:**
```cpp
void checkFeedCommand() {
  // GET feed_commands
  String url = SUPABASE_URL + "/rest/v1/feed_commands?order=created_at.asc&limit=1";
  String response = http.GET(url);
  
  if (response has rows) {
    int portions = parsePortions(response);
    runFeeder(portions);
    deleteFeedCommand(idFromResponse);
    postFeedingEvent(portions);
  }
}
```

---

## Step 5: Daily log (optional)

Once per day, save a snapshot for the Logs tab.

**Example:**
```
POST https://abcdefgh.supabase.co/rest/v1/sensor_daily_log

Body: {"sensor": "food_level", "log_date": "2025-02-15", "distance_cm": 8.5}
```

For weight: `{"sensor": "weight", "log_date": "2025-02-15", "weight_grams": 95.2}`  
For motion: `{"sensor": "motion", "log_date": "2025-02-15", "motion_count": 12}`

---

## Quick checklist

| Step | Where | What |
|------|-------|-----|
| 1 | `lib/config.ts` | Add supabaseUrl and supabasePublishableKey |
| 2 | Supabase SQL Editor | Run sensor_states.sql, feed_commands.sql |
| 2 | Supabase SQL Editor | Run `alter publication supabase_realtime add table sensor_states` |
| 3 | ESP code | Save SUPABASE_URL and SUPABASE_KEY |
| 4 | ESP loop | PATCH food_level every 30s |
| 4 | ESP loop | PATCH weight every 30s |
| 4 | ESP (PIR callback) | PATCH motion when detected |
| 4 | ESP loop | Poll feed_commands, run feeder, delete, POST feeding_events |