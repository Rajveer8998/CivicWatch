/**
 * ==============================================================================
 * CivicPulse - Modular API Service & Data Layer
 * ==============================================================================
 * This service handles all data fetching, persistence, and state updates.
 * - Out of the box: Uses a persistent LocalStorage mock database with realistic delay.
 * - Ready for Backend: Contains pre-built fetch() templates for REST API / Supabase.
 *
 * For Hackathon Teams:
 * To connect to your Python FastAPI, Node.js Express, or Firebase backend:
 * 1. Open `config.js` and set `APP_CONFIG.DATA_STORAGE_TYPE = 'rest_api'` (or 'supabase')
 * 2. Set `APP_CONFIG.BACKEND_API.ENABLED = true` and update `BASE_URL`
 * 3. The functions below will automatically route to your backend!
 */

class CivicApiService {
  constructor() {
    this.storageKey = "civicpulse_issues_v1";
    this.initDatabase();
  }

  /**
   * Initializes database in localStorage if empty.
   */
  initDatabase() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        localStorage.setItem(this.storageKey, JSON.stringify(window.INITIAL_ISSUES || []));
      }
    } catch (e) {
      console.warn("LocalStorage unavailable, falling back to memory.", e);
    }
  }

  /**
   * Internal helper to simulate network latency for realistic UI state testing.
   */
  async _mockLatency(ms = 120) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --------------------------------------------------------------------------
  // 1. FETCH ALL CIVIC ISSUES
  // --------------------------------------------------------------------------
  async getIssues(filterOptions = {}) {
    // If real REST backend is enabled:
    if (window.APP_CONFIG?.BACKEND_API?.ENABLED && window.APP_CONFIG?.DATA_STORAGE_TYPE === "rest_api") {
      try {
        const queryParams = new URLSearchParams(filterOptions).toString();
        const url = `${APP_CONFIG.BACKEND_API.BASE_URL}${APP_CONFIG.BACKEND_API.ENDPOINTS.GET_ISSUES}?${queryParams}`;
        const response = await fetch(url, { headers: APP_CONFIG.BACKEND_API.HEADERS });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return await response.json();
      } catch (err) {
        console.error("Backend API error, falling back to local database:", err);
      }
    }

    // Default LocalStorage Mock Database:
    await this._mockLatency(80);
    let issues = [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      issues = stored ? JSON.parse(stored) : (window.INITIAL_ISSUES || []);
    } catch (e) {
      issues = window.INITIAL_ISSUES || [];
    }

    // Apply filters if provided
    if (filterOptions.category && filterOptions.category !== "all") {
      issues = issues.filter(item => item.category === filterOptions.category);
    }
    if (filterOptions.status && filterOptions.status !== "all") {
      issues = issues.filter(item => item.status === filterOptions.status);
    }
    if (filterOptions.severity && filterOptions.severity !== "all") {
      issues = issues.filter(item => item.severity === filterOptions.severity);
    }

    return issues;
  }

  // --------------------------------------------------------------------------
  // 2. GET SINGLE ISSUE BY ID
  // --------------------------------------------------------------------------
  async getIssueById(issueId) {
    if (window.APP_CONFIG?.BACKEND_API?.ENABLED && window.APP_CONFIG?.DATA_STORAGE_TYPE === "rest_api") {
      try {
        const url = `${APP_CONFIG.BACKEND_API.BASE_URL}${APP_CONFIG.BACKEND_API.ENDPOINTS.GET_ISSUE_BY_ID.replace(':id', issueId)}`;
        const response = await fetch(url, { headers: APP_CONFIG.BACKEND_API.HEADERS });
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Backend fetch error:", err);
      }
    }

    await this._mockLatency(50);
    const issues = await this.getIssues();
    return issues.find(item => item.id === issueId) || null;
  }

  // --------------------------------------------------------------------------
  // 3. CREATE NEW CIVIC REPORT
  // --------------------------------------------------------------------------
  async createIssue(newReportData) {
    // Structure of complete issue object
    const createdRecord = {
      id: "civic-" + Math.floor(1000 + Math.random() * 9000),
      title: newReportData.title || "Civic Hazard Report",
      category: newReportData.category || "pothole",
      severity: newReportData.severity || "medium",
      status: "reported",
      description: newReportData.description || "",
      lat: parseFloat(newReportData.lat) || APP_CONFIG.MAP_DEFAULTS.DEFAULT_LAT,
      lng: parseFloat(newReportData.lng) || APP_CONFIG.MAP_DEFAULTS.DEFAULT_LNG,
      address: newReportData.address || "Reported Location",
      neighborhood: newReportData.neighborhood || "Metro Area",
      imageUrl: newReportData.imageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      reporter: {
        name: newReportData.isAnonymous ? "Anonymous Citizen" : (newReportData.reporterName || "Active Citizen"),
        avatar: newReportData.isAnonymous 
          ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" 
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        reputation: 10
      },
      upvotes: 1, // Author automatic upvote
      upvotedByMe: true,
      createdAt: new Date().toISOString(),
      department: this._assignDepartment(newReportData.category),
      timeline: [
        {
          status: "reported",
          label: "Report Received by CivicWatch Dispatch",
          time: "Just now",
          note: "GPS pin verified and queued for municipal inspection."
        }
      ],
      comments: []
    };

    // If REST API is enabled:
    if (window.APP_CONFIG?.BACKEND_API?.ENABLED && window.APP_CONFIG?.DATA_STORAGE_TYPE === "rest_api") {
      try {
        const url = `${APP_CONFIG.BACKEND_API.BASE_URL}${APP_CONFIG.BACKEND_API.ENDPOINTS.CREATE_ISSUE}`;
        const response = await fetch(url, {
          method: "POST",
          headers: APP_CONFIG.BACKEND_API.HEADERS,
          body: JSON.stringify(createdRecord)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Backend create error, writing locally:", err);
      }
    }

    // LocalStorage write:
    await this._mockLatency(150);
    const stored = localStorage.getItem(this.storageKey);
    const issues = stored ? JSON.parse(stored) : (window.INITIAL_ISSUES || []);
    issues.unshift(createdRecord); // Prepend to top
    localStorage.setItem(this.storageKey, JSON.stringify(issues));

    return createdRecord;
  }

  // --------------------------------------------------------------------------
  // 4. UPVOTE / "ME TOO" ON AN ISSUE
  // --------------------------------------------------------------------------
  async toggleUpvote(issueId) {
    if (window.APP_CONFIG?.BACKEND_API?.ENABLED && window.APP_CONFIG?.DATA_STORAGE_TYPE === "rest_api") {
      try {
        const url = `${APP_CONFIG.BACKEND_API.BASE_URL}${APP_CONFIG.BACKEND_API.ENDPOINTS.UPVOTE_ISSUE.replace(':id', issueId)}`;
        const res = await fetch(url, { method: "POST", headers: APP_CONFIG.BACKEND_API.HEADERS });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend upvote failed, falling back to local:", err);
      }
    }

    await this._mockLatency(60);
    const stored = localStorage.getItem(this.storageKey);
    let issues = stored ? JSON.parse(stored) : (window.INITIAL_ISSUES || []);
    
    let target = issues.find(i => i.id === issueId);
    if (target) {
      if (target.upvotedByMe) {
        target.upvotes = Math.max(0, target.upvotes - 1);
        target.upvotedByMe = false;
      } else {
        target.upvotes += 1;
        target.upvotedByMe = true;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(issues));
      return target;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 5. ADD COMMENT
  // --------------------------------------------------------------------------
  async addComment(issueId, commentText, authorName = "Citizen Contributor") {
    if (window.APP_CONFIG?.BACKEND_API?.ENABLED && window.APP_CONFIG?.DATA_STORAGE_TYPE === "rest_api") {
      try {
        const url = `${APP_CONFIG.BACKEND_API.BASE_URL}${APP_CONFIG.BACKEND_API.ENDPOINTS.ADD_COMMENT.replace(':id', issueId)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: APP_CONFIG.BACKEND_API.HEADERS,
          body: JSON.stringify({ text: commentText, author: authorName })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend comment failed, fallback:", err);
      }
    }

    await this._mockLatency(80);
    const stored = localStorage.getItem(this.storageKey);
    let issues = stored ? JSON.parse(stored) : (window.INITIAL_ISSUES || []);
    
    let target = issues.find(i => i.id === issueId);
    if (target) {
      if (!target.comments) target.comments = [];
      const newComment = {
        id: "c-" + Date.now(),
        author: authorName,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        text: commentText,
        createdAt: "Just now"
      };
      target.comments.push(newComment);
      localStorage.setItem(this.storageKey, JSON.stringify(issues));
      return newComment;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 6. UPDATE ISSUE STATUS (MUNICIPAL / DEMO CONTROLLER)
  // --------------------------------------------------------------------------
  async updateStatus(issueId, newStatus, statusNote = "") {
    const stored = localStorage.getItem(this.storageKey);
    let issues = stored ? JSON.parse(stored) : (window.INITIAL_ISSUES || []);
    let target = issues.find(i => i.id === issueId);

    if (target) {
      target.status = newStatus;
      if (!target.timeline) target.timeline = [];
      
      const statusLabels = {
        reported: "Reported by Citizen",
        verified: "Verified by City Inspector",
        in_progress: "Crew Dispatched & Repair In Progress",
        resolved: "Civic Issue Resolved & Closed"
      };

      target.timeline.push({
        status: newStatus,
        label: statusLabels[newStatus] || newStatus,
        time: "Just now",
        note: statusNote || `Status changed to ${newStatus}.`
      });

      localStorage.setItem(this.storageKey, JSON.stringify(issues));
      return target;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 7. RESET DATABASE TO SAMPLE SEED (DEMO RESET BUTTON)
  // --------------------------------------------------------------------------
  resetToSampleData() {
    localStorage.setItem(this.storageKey, JSON.stringify(window.INITIAL_ISSUES || []));
    return window.INITIAL_ISSUES || [];
  }

  // Helper to assign default responsible department based on category
  _assignDepartment(category) {
    const deptMap = {
      pothole: "Department of Transportation (DOT)",
      garbage: "Public Works & Sanitation",
      streetlight: "Bureau of Street Lighting",
      water_leak: "Municipal Water Works",
      traffic_signal: "Traffic Operations Center",
      sidewalk: "Sidewalk Maintenance Program",
      tree_hazard: "Parks & Recreation Forestry",
      other: "General City Maintenance"
    };
    return deptMap[category] || "Municipal Works Department";
  }
}

// Global API service instance
window.civicApi = new CivicApiService();
