/**
 * ==============================================================================
 * CivicPulse - Configuration & Backend Integration Settings
 * ==============================================================================
 * This file serves as the central configuration hub for your hackathon project.
 * It contains placeholders for your API keys, backend server URLs, database
 * connectors (Firebase / Supabase / Node.js / Python FastAPI), and feature flags.
 *
 * To connect to your real backend, simply update the settings below!
 */

const APP_CONFIG = {
  // Application Information
  appName: "CivicWatch",
  version: "1.0.0",
  tagline: "Empowering Citizens, Fixing Cities Together",

  // --------------------------------------------------------------------------
  // BACKEND / DATABASE CONFIGURATION
  // --------------------------------------------------------------------------
  // Choose your storage backend: 'local' (Browser localStorage) | 'rest_api' | 'supabase' | 'firebase'
  DATA_STORAGE_TYPE: 'local',

  // REST API Endpoints (e.g. Node.js Express, Python FastAPI / Flask, Django)
  BACKEND_API: {
    ENABLED: false, // Set to true when your backend server is running
    BASE_URL: "http://localhost:8000/api/v1", // Replace with your live backend URL
    ENDPOINTS: {
      GET_ISSUES: "/issues",
      GET_ISSUE_BY_ID: "/issues/:id",
      CREATE_ISSUE: "/issues",
      UPVOTE_ISSUE: "/issues/:id/upvote",
      ADD_COMMENT: "/issues/:id/comments",
      UPDATE_STATUS: "/issues/:id/status",
      UPLOAD_IMAGE: "/media/upload"
    },
    HEADERS: {
      "Content-Type": "application/json",
      // "Authorization": "Bearer YOUR_BACKEND_JWT_TOKEN_HERE" // Uncomment for auth
    }
  },

  // --------------------------------------------------------------------------
  // THIRD-PARTY API KEYS & INTEGRATIONS (Placeholders for your hackathon)
  // --------------------------------------------------------------------------
  API_KEYS: {
    // Maps Providers (Leaflet OpenStreetMap works without keys out-of-the-box!)
    MAPBOX_TOKEN: "pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLWFwaS1rZXkifQ...", // Optional: Mapbox GL key
    GOOGLE_MAPS_KEY: "AIzaSyYourGoogleMapsApiKeyHere...", // Optional: Google Maps API key
    
    // Cloudinary / AWS S3 for Image Storage (Optional)
    CLOUDINARY_UPLOAD_PRESET: "civic_reports_unsigned",
    CLOUDINARY_CLOUD_NAME: "your_cloud_name",

    // AI & Vision API Key (e.g., for auto-detecting potholes / garbage via Gemini API)
    AI_VISION_API_KEY: "AIzaSyGeminiApiKeyPlaceholder...",
    AI_AUTO_CLASSIFY_ENABLED: false // Set to true if integrating AI detection
  },

  // --------------------------------------------------------------------------
  // SUPABASE / FIREBASE CONFIGURATION (If using Backend-as-a-Service)
  // --------------------------------------------------------------------------
  SUPABASE: {
    URL: "https://your-project.supabase.co",
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },

  FIREBASE: {
    apiKey: "AIzaSy...",
    authDomain: "civicpulse-hackathon.firebaseapp.com",
    projectId: "civicpulse-hackathon",
    storageBucket: "civicpulse-hackathon.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
  },

  // --------------------------------------------------------------------------
  // MAP DEFAULT SETTINGS
  // --------------------------------------------------------------------------
  MAP_DEFAULTS: {
    // Default city center (Metro Center coordinates - customizable to any city)
    DEFAULT_LAT: 37.7749,
    DEFAULT_LNG: -122.4194,
    DEFAULT_ZOOM: 13,
    DEFAULT_CITY_NAME: "San Francisco Metro", // Displays in header
    TILE_LAYER: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },

  // --------------------------------------------------------------------------
  // CATEGORIES & LABELS
  // --------------------------------------------------------------------------
  CATEGORIES: [
    { id: "pothole", name: "Pothole / Road Damage", icon: "🚧", color: "#f59e0b", badgeClass: "badge-amber" },
    { id: "garbage", name: "Garbage / Illegal Dumping", icon: "🗑️", color: "#10b981", badgeClass: "badge-emerald" },
    { id: "streetlight", name: "Streetlight Malfunction", icon: "💡", color: "#6366f1", badgeClass: "badge-indigo" },
    { id: "water_leak", name: "Water Leak / Pipe Burst", icon: "💧", color: "#06b6d4", badgeClass: "badge-cyan" },
    { id: "traffic_signal", name: "Broken Traffic Signal", icon: "🚦", color: "#ef4444", badgeClass: "badge-rose" },
    { id: "sidewalk", name: "Damaged Sidewalk / Curb", icon: "🚶", color: "#8b5cf6", badgeClass: "badge-purple" },
    { id: "tree_hazard", name: "Fallen Tree / Overgrowth", icon: "🌳", color: "#84cc16", badgeClass: "badge-lime" },
    { id: "other", name: "Other Civic Hazard", icon: "⚠️", color: "#64748b", badgeClass: "badge-slate" }
  ],

  // Severity definitions
  SEVERITY_LEVELS: {
    low: { label: "Low", color: "#10b981", desc: "Minor inconvenience, no immediate risk" },
    medium: { label: "Medium", color: "#f59e0b", desc: "Noticeable hazard, needs municipal attention" },
    high: { label: "High", color: "#f97316", desc: "Safety hazard for pedestrians or vehicles" },
    critical: { label: "Critical", color: "#ef4444", desc: "Immediate danger / accident risk" }
  },

  // Status Lifecycle
  STATUS_OPTIONS: [
    { id: "reported", label: "Reported", color: "#f59e0b", step: 1 },
    { id: "verified", label: "Verified by City", color: "#3b82f6", step: 2 },
    { id: "in_progress", label: "Work In Progress", color: "#8b5cf6", step: 3 },
    { id: "resolved", label: "Resolved", color: "#10b981", step: 4 }
  ]
};

// Export configuration to global window object for browser access
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
