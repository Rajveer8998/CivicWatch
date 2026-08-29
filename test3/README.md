# 🏙️ CivicWatch - Pothole & Civic Issue Reporter with Map View

A modern, responsive, and feature-rich civic issue reporting web application designed for hackathons. It allows citizens to report public infrastructure hazards (potholes, garbage dumps, broken streetlights, water leaks, traffic signals, fallen trees) with photo uploads, live GPS coordinates, status tracking timelines, and an interactive shared map.

Built with clean **HTML5, CSS3, and modern Vanilla JavaScript** with **zero build dependencies required**, plus dedicated integration hooks for plugging in any backend (Node.js/Express, Python FastAPI/Flask, Supabase, or Firebase) in minutes.

---

## ✨ Key Features

1. **🗺️ Interactive Shared Map (Leaflet.js + OpenStreetMap)**
   - Category-colored custom pin markers with pulse rings for critical hazards.
   - Click anywhere on the map or drag pins to report an issue directly at exact coordinates.
   - GPS **"Locate Me"** button with browser Geolocation API integration.
   - Rich interactive map popups with photo thumbnails, status pills, and upvote counters.

2. **📸 Civic Issue Reporting Workflow (Modal / Drawer)**
   - **Category Selection**: Visual icons (Potholes, Garbage, Streetlights, Water Leaks, Signals, Sidewalks, Fallen Trees).
   - **Photo Upload**: Drag-and-drop zone, camera input support, Base64 preview, and **1-click Quick Sample Photos** for fast hackathon demoing.
   - **GPS & Location**: Interactive mini-map coordinate picker, auto GPS detection, and address lookup.
   - **Urgency Levels**: Low, Medium, High, and Critical severity indicators.
   - **Privacy Options**: Public citizen name or Anonymous report mode.

3. **📢 Community Engagement & Feed**
   - **"+1 / Me Too" Endorsements**: Upvote issues to highlight high-traffic hazard areas.
   - **Status Progress Lifecycle**: Track issues through *Reported → Verified → Crew Dispatched → Resolved*.
   - **Public Discussion**: Comment threads on individual reports.
   - **Live Municipal Control (Demo Mode)**: Test button in issue details for hackathon judges to simulate city officials updating repair status in real-time.

4. **📊 City Analytics & Citizen Leaderboard**
   - Live KPI metric cards (Total Logged, Resolution Rate %, In Progress, Citizen Endorsements).
   - Category breakdown charts and municipal department response efficiency stats.
   - Gamified Civic Leaderboard with citizen guardian badges and points.

5. **🎨 Modern UI & UX**
   - Glassmorphism design with `backdrop-filter: blur(12px)`.
   - **Dark & Light Mode** toggle with instant localStorage persistence.
   - Fully responsive for mobile, tablet, and desktop split-view.

---

## 🚀 How to Run

### Method 1: Instant Browser Launch (Zero Installation)
Simply double-click [`index.html`](./index.html) or open it in any modern browser (Chrome, Edge, Safari, Firefox). Everything works immediately out of the box with offline/online map tile rendering and localStorage mock database persistence!

### Method 2: Local HTTP Server (Recommended for Hackathons)
Using Python:
```bash
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

Or using Node.js:
```bash
npx serve .
```

---

## 🔌 Connecting Your Backend & Database

The frontend has been pre-architected with clean, modular separation. Everything you need to customize is organized in [`config.js`](./config.js) and [`api.js`](./api.js).

### 1. Connecting a Python (FastAPI/Flask) or Node.js (Express) REST API
1. Open [`config.js`](./config.js).
2. Set `DATA_STORAGE_TYPE: 'rest_api'`.
3. Set `BACKEND_API.ENABLED = true` and update `BASE_URL` with your server URL:
   ```javascript
   BACKEND_API: {
     ENABLED: true,
     BASE_URL: "http://localhost:8000/api/v1",
     ...
   }
   ```
4. Expected REST Endpoints in your backend:
   - `GET /issues` - Return array of issue objects.
   - `POST /issues` - Create a new civic issue report.
   - `GET /issues/:id` - Return a single issue by ID.
   - `POST /issues/:id/upvote` - Toggle upvote count.
   - `POST /issues/:id/comments` - Add a comment to an issue.
   - `POST /issues/:id/status` - Update issue lifecycle status.

### 2. Connecting Supabase / Firebase
In [`config.js`](./config.js), fill in your `SUPABASE` or `FIREBASE` credentials in the provided config objects, then configure [`api.js`](./api.js) to initialize the respective client SDK.

### 3. Adding API Keys (Mapbox, Google Maps, Gemini AI Vision)
Placeholders are pre-defined in `APP_CONFIG.API_KEYS`:
- `MAPBOX_TOKEN`: To switch from OpenStreetMap to Mapbox tiles.
- `GOOGLE_MAPS_KEY`: If you wish to use Google Maps Geocoding / Street View.
- `AI_VISION_API_KEY`: For attaching Google Gemini Vision API to auto-classify pothole severity from photos.

---

## 📁 File Structure

```
civic-issue-reporter/
├── index.html          # Semantic single-page application structure
├── styles.css          # Modern CSS styling with glassmorphism & dark/light mode
├── config.js           # API keys, backend endpoints, storage type, and map defaults
├── data.js             # Realistic sample seed dataset, sample photos, and leaderboard
├── api.js              # Modular async API service (localStorage mock DB + REST adapters)
├── app.js              # Application logic: Leaflet map, GPS geolocation, UI workflows
└── README.md           # Documentation & setup instructions
```

---

## 🏆 Hackathon Demo Pitch Tips

1. **Live GPS Pinning**: Click anywhere on the map or click **"Report Issue"** -> **"Detect GPS"** to show real-time coordinate capture.
2. **Instant Test Photos**: In the report modal, click any of the **Quick Sample Photos** chips (Road Pothole, Garbage Pile, Broken Lamp) to instantly populate test evidence without having to find files.
3. **Simulate City Repair**: Open any issue card -> click **"Dispatch Crew"** or **"Resolve Issue"** under the Municipal Control box to show live status timeline progression.
4. **Analytics Transparency**: Click **"City Stats"** to show municipal resolution rates and category breakdown charts.
