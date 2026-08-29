/**
 * ==============================================================================
 * CivicPulse - Core Application Controller
 * ==============================================================================
 * Handles map rendering, geolocation, real-time filtering, UI interactions,
 * reporting workflows, upvoting, comments, and map interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const state = {
    currentView: "map",
    theme: localStorage.getItem("civicpulse_theme") || "light",
    filters: {
      category: "all",
      status: "all",
      sortBy: "newest"
    },
    issues: [],
    selectedIssue: null,
    map: null,
    miniPickerMap: null,
    miniPickerMarker: null,
    markerLayerGroup: null,
    pickedCoords: {
      lat: APP_CONFIG.MAP_DEFAULTS.DEFAULT_LAT,
      lng: APP_CONFIG.MAP_DEFAULTS.DEFAULT_LNG
    },
    userLocationMarker: null,
    uploadedPhotoBase64: null
  };

  // --------------------------------------------------------------------------
  // DOM Elements Cache
  // --------------------------------------------------------------------------
  const DOM = {
    // Theme & Navigation
    html: document.documentElement,
    btnThemeToggle: document.getElementById("btn-theme-toggle"),
    btnResetDemo: document.getElementById("btn-reset-demo"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    viewSections: document.querySelectorAll(".view-section"),
    headerActiveCount: document.getElementById("header-active-count"),
    headerCityName: document.getElementById("header-city-name"),

    // Map View Elements
    civicMap: document.getElementById("civic-map"),
    btnMapLocateMe: document.getElementById("btn-map-locate-me"),
    btnMapRecenter: document.getElementById("btn-map-recenter"),

    // Feed View Elements
    feedCardsGrid: document.getElementById("feed-cards-grid"),
    feedSortSelect: document.getElementById("feed-sort-select"),

    // Report Modal
    modalReportOverlay: document.getElementById("modal-report-overlay"),
    btnOpenReportModal: document.getElementById("btn-open-report-modal"),
    btnCloseReportModal: document.getElementById("btn-close-report-modal"),
    btnCancelReport: document.getElementById("btn-cancel-report"),
    formReportIssue: document.getElementById("form-report-issue"),
    modalCategorySelector: document.getElementById("modal-category-selector"),
    reportInputCategory: document.getElementById("report-input-category"),
    reportPhotoDropzone: document.getElementById("report-photo-dropzone"),
    reportFileInput: document.getElementById("report-file-input"),
    photoPreviewBox: document.getElementById("photo-preview-box"),
    photoPreviewElement: document.getElementById("photo-preview-element"),
    btnRemovePhoto: document.getElementById("btn-remove-photo"),
    samplePhotosContainer: document.getElementById("sample-photos-container"),
    reportInputAddress: document.getElementById("report-input-address"),
    btnReportDetectGps: document.getElementById("btn-report-detect-gps"),
    valPickerLat: document.getElementById("val-picker-lat"),
    valPickerLng: document.getElementById("val-picker-lng"),
    reportInputLat: document.getElementById("report-input-lat"),
    reportInputLng: document.getElementById("report-input-lng"),
    severityPickerGroup: document.getElementById("severity-picker-group"),
    reportInputSeverity: document.getElementById("report-input-severity"),
    reportInputTitle: document.getElementById("report-input-title"),
    reportInputDesc: document.getElementById("report-input-desc"),
    reportCheckboxAnon: document.getElementById("report-checkbox-anon"),
    reportInputName: document.getElementById("report-input-name"),

    // Detail Modal
    modalDetailOverlay: document.getElementById("modal-detail-overlay"),
    btnCloseDetailModal: document.getElementById("btn-close-detail-modal"),
    btnCloseDetailFooter: document.getElementById("btn-close-detail-footer"),
    detailModalTitle: document.getElementById("detail-modal-title"),
    detailModalBody: document.getElementById("detail-modal-body"),
    detailBtnUpvote: document.getElementById("detail-btn-upvote"),
    detailUpvoteCount: document.getElementById("detail-upvote-count"),
    detailUpvoteText: document.getElementById("detail-upvote-text"),

    // Toast
    toastContainer: document.getElementById("toast-container")
  };

  // --------------------------------------------------------------------------
  // Initialize Application
  // --------------------------------------------------------------------------
  async function init() {
    applyTheme(state.theme);
    setupEventListeners();
    initSamplePhotoChips();
    initMainMap();
    await reloadData();
  }

  // --------------------------------------------------------------------------
  // Theme Management
  // --------------------------------------------------------------------------
  function applyTheme(theme) {
    state.theme = theme;
    DOM.html.setAttribute("data-theme", theme);
    localStorage.setItem("civicpulse_theme", theme);

    if (DOM.btnThemeToggle) {
      DOM.btnThemeToggle.innerHTML = theme === "dark" 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  }

  // --------------------------------------------------------------------------
  // Navigation & View Switching
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    state.currentView = viewName;
    
    // Update tabs
    DOM.tabButtons.forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update section visibility
    DOM.viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Invalidate map size when switching back to map
    if (viewName === "map" && state.map) {
      setTimeout(() => state.map.invalidateSize(), 150);
    }
  }

  // --------------------------------------------------------------------------
  // Leaflet Map Initialization
  // --------------------------------------------------------------------------
  function initMainMap() {
    if (typeof L === "undefined") {
      console.error("Leaflet library not loaded");
      return;
    }

    const { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM, TILE_LAYER, ATTRIBUTION } = APP_CONFIG.MAP_DEFAULTS;

    // Create Map
    state.map = L.map(DOM.civicMap, {
      zoomControl: false,
      attributionControl: true
    }).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

    // Add Tile Layer
    L.tileLayer(TILE_LAYER, {
      maxZoom: 19,
      attribution: ATTRIBUTION
    }).addTo(state.map);

    // Add Zoom Control at bottom left
    L.control.zoom({ position: "bottomleft" }).addTo(state.map);

    // Marker Layer Group
    state.markerLayerGroup = L.layerGroup().addTo(state.map);

    // Map click handler -> Allows citizen to click directly on map to report
    state.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      openReportModalWithCoords(lat, lng);
    });

    centerMapOnLiveLocation(false);
  }

  function centerMapOnLiveLocation(showToastOnSuccess = true) {
    if (!navigator.geolocation || !state.map) {
      if (showToastOnSuccess) showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        state.map.setView([lat, lng], 16);
        showUserLocationMarker(lat, lng);
        if (DOM.headerCityName) DOM.headerCityName.textContent = "Your live location";
        if (showToastOnSuccess) showToast("Centered map to your current location 📍", "success");
      },
      (err) => {
        console.warn("GPS error:", err);
        if (showToastOnSuccess) showToast("Could not get your live location. Allow location access and try again.", "error");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function showUserLocationMarker(lat, lng) {
    if (!state.map) return;
    if (state.userLocationMarker) {
      state.userLocationMarker.setLatLng([lat, lng]);
      return;
    }
    const icon = L.divIcon({
      className: "user-location-icon",
      html: '<div class="user-location-dot"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    state.userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(state.map);
  }

  // --------------------------------------------------------------------------
  // Custom Map Markers & Popups
  // --------------------------------------------------------------------------
  function createCustomMarkerIcon(issue) {
    const category = APP_CONFIG.CATEGORIES.find(c => c.id === issue.category) || APP_CONFIG.CATEGORIES[0];
    const isCritical = issue.severity === "critical" && issue.status !== "resolved";

    const html = `
      <div class="custom-map-marker" title="${issue.title}">
        ${isCritical ? '<div class="marker-pulse-ring"></div>' : ''}
        <div class="marker-pin" style="background-color: ${category.color};">
          <div class="marker-icon-inner">${category.icon}</div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: "custom-leaflet-icon",
      html: html,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36]
    });
  }

  function createPopupContent(issue) {
    const category = APP_CONFIG.CATEGORIES.find(c => c.id === issue.category) || APP_CONFIG.CATEGORIES[0];
    return `
      <div class="popup-card">
        <img class="popup-img" src="${issue.imageUrl}" alt="${issue.title}" loading="lazy" />
        <div class="popup-body">
          <div style="display: flex; gap: 0.35rem; align-items: center; margin-bottom: 0.2rem;">
            <span class="badge ${category.badgeClass}">${category.icon} ${category.name}</span>
            <span class="status-badge status-${issue.status}">${issue.status.replace('_', ' ')}</span>
          </div>
          <div class="popup-title">${issue.title}</div>
          <div class="popup-address">📍 ${issue.address}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 0.25rem;">
            <span>👍 ${issue.upvotes} endorsements</span>
            <span>🚨 ${issue.severity.toUpperCase()}</span>
          </div>
          <button class="popup-btn-full" onclick="window.viewIssueDetail('${issue.id}')">
            View Full Report & Timeline
          </button>
        </div>
      </div>
    `;
  }

  function updateMapMarkers(issues) {
    if (!state.map || !state.markerLayerGroup) return;

    state.markerLayerGroup.clearLayers();

    issues.forEach(issue => {
      if (!issue.lat || !issue.lng) return;

      const icon = createCustomMarkerIcon(issue);
      const marker = L.marker([issue.lat, issue.lng], { icon: icon });
      marker.bindPopup(createPopupContent(issue));

      state.markerLayerGroup.addLayer(marker);
    });
  }

  // --------------------------------------------------------------------------
  // Data Loading & Filtering
  // --------------------------------------------------------------------------
  async function reloadData() {
    try {
      const issues = await window.civicApi.getIssues(state.filters);
      
      // Sort issues
      sortIssuesArray(issues, state.filters.sortBy);
      state.issues = issues;

      // Update UI counts
      const activeCount = issues.filter(i => i.status !== "resolved").length;
      DOM.headerActiveCount.textContent = `${activeCount} Active Reports`;

      // Render Components
      updateMapMarkers(issues);
      renderFeedCards(issues);

    } catch (err) {
      console.error("Failed to load issues:", err);
      showToast("Error updating issues list", "error");
    }
  }

  function sortIssuesArray(arr, sortBy) {
    if (sortBy === "newest") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "upvotes") {
      arr.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "severity") {
      const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
      arr.sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
    }
  }

  // --------------------------------------------------------------------------
  // Render Components: Cards & Drawers
  // --------------------------------------------------------------------------
  function createIssueCardHTML(issue) {
    const category = APP_CONFIG.CATEGORIES.find(c => c.id === issue.category) || APP_CONFIG.CATEGORIES[0];
    const upvotedClass = issue.upvotedByMe ? "active" : "";

    return `
      <div class="issue-card" id="card-${issue.id}" data-id="${issue.id}">
        <div class="card-media-wrapper">
          <img class="card-img" src="${issue.imageUrl}" alt="${issue.title}" loading="lazy" />
          <div class="card-badges-top">
            <span class="badge ${category.badgeClass}">${category.icon} ${category.name}</span>
            <span class="status-badge status-${issue.status}">${issue.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-title">${issue.title}</div>
          <div class="card-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${issue.address}</span>
          </div>
          <div class="card-desc">${issue.description}</div>
        </div>

        <div class="card-footer">
          <div class="reporter-mini">
            <img class="reporter-avatar" src="${issue.reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}" alt="Reporter" />
            <span class="reporter-name">${issue.reporter?.name || 'Citizen'}</span>
          </div>
          
          <div class="card-actions">
            <button class="btn-upvote ${upvotedClass}" onclick="window.handleUpvote('${issue.id}', event)" title="Endorse this report">
              👍 <span>${issue.upvotes}</span>
            </button>
            <button class="btn-view-details" onclick="window.viewIssueDetail('${issue.id}')">
              Details →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderFeedCards(issues) {
    if (!DOM.feedCardsGrid) return;
    if (issues.length === 0) {
      DOM.feedCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <h3>No civic issues found</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try a different category or status filter.</p>
        </div>
      `;
      return;
    }
    DOM.feedCardsGrid.innerHTML = issues.map(createIssueCardHTML).join("");
  }

  // --------------------------------------------------------------------------
  // Upvoting Functionality
  // --------------------------------------------------------------------------
  window.handleUpvote = async function(issueId, event) {
    if (event) event.stopPropagation();
    try {
      const updated = await window.civicApi.toggleUpvote(issueId);
      if (updated) {
        showToast(updated.upvotedByMe ? "Thanks for endorsing this issue! 👍" : "Upvote removed", "info");
        await reloadData();

        // Update detail modal if open
        if (state.selectedIssue && state.selectedIssue.id === issueId) {
          state.selectedIssue = updated;
          if (DOM.detailUpvoteCount) DOM.detailUpvoteCount.textContent = updated.upvotes;
          if (DOM.detailBtnUpvote) {
            if (updated.upvotedByMe) DOM.detailBtnUpvote.classList.add("active");
            else DOM.detailBtnUpvote.classList.remove("active");
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --------------------------------------------------------------------------
  // Detail Modal & Interactive Timeline
  // --------------------------------------------------------------------------
  window.viewIssueDetail = async function(issueId) {
    const issue = await window.civicApi.getIssueById(issueId);
    if (!issue) return;

    state.selectedIssue = issue;
    const category = APP_CONFIG.CATEGORIES.find(c => c.id === issue.category) || APP_CONFIG.CATEGORIES[0];

    DOM.detailModalTitle.innerHTML = `
      <span>${category.icon}</span>
      <span>${issue.title}</span>
    `;

    if (DOM.detailUpvoteCount) DOM.detailUpvoteCount.textContent = issue.upvotes;
    if (DOM.detailBtnUpvote) {
      if (issue.upvotedByMe) DOM.detailBtnUpvote.classList.add("active");
      else DOM.detailBtnUpvote.classList.remove("active");
    }

    // Timeline steps rendering
    const timelineHTML = (issue.timeline || []).map(t => `
      <div class="timeline-item active">
        <div class="timeline-dot"></div>
        <div class="timeline-title">${t.label}</div>
        <div class="timeline-time">${t.time}</div>
        ${t.note ? `<div class="timeline-note">${t.note}</div>` : ''}
      </div>
    `).join("");

    // Comments rendering
    const commentsHTML = (issue.comments || []).map(c => `
      <div class="comment-item">
        <img src="${c.avatar}" alt="${c.author}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <span class="comment-author">${c.author}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${c.createdAt}</span>
          </div>
          <div class="comment-text">${c.text}</div>
        </div>
      </div>
    `).join("");

    DOM.detailModalBody.innerHTML = `
      <div class="detail-layout-grid">
        <!-- Left: Media & Quick Details -->
        <div>
          <div class="detail-image-box">
            <img src="${issue.imageUrl}" alt="${issue.title}" />
          </div>

          <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="badge ${category.badgeClass}">${category.icon} ${category.name}</span>
              <span class="status-badge status-${issue.status}">${issue.status.replace('_', ' ')}</span>
              <span class="severity-pill severity-${issue.severity}">Severity: ${issue.severity.toUpperCase()}</span>
            </div>

            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
              <strong>📍 Location:</strong> ${issue.address} (${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)})
            </div>

            <div style="font-size: 0.85rem; color: var(--text-muted);">
              <strong>🏢 Assigned Dept:</strong> ${issue.department || 'Municipal Works'}
            </div>

            <div style="font-size: 0.85rem; color: var(--text-muted);">
              <strong>👤 Reported By:</strong> ${issue.reporter?.name || 'Citizen'}
            </div>

            <p style="font-size: 0.9rem; line-height: 1.5; margin-top: 0.5rem; background: var(--bg-muted); padding: 0.75rem; border-radius: var(--radius-md);">
              ${issue.description}
            </p>
          </div>
        </div>

        <!-- Right: Status Timeline & Discussion -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Municipal Simulation Action Box (Judges can test status changes) -->
          <div class="admin-actions-box">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">⚙️ Municipal Control (Live Demo)</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">Simulate city crew action</span>
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button class="status-pill-btn" onclick="window.changeIssueStatus('${issue.id}', 'verified')">Mark Verified</button>
              <button class="status-pill-btn" onclick="window.changeIssueStatus('${issue.id}', 'in_progress')">Dispatch Crew</button>
              <button class="status-pill-btn" style="background: rgba(16,185,129,0.15); color: #059669;" onclick="window.changeIssueStatus('${issue.id}', 'resolved')">Resolve Issue ✅</button>
            </div>
          </div>

          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Status Timeline</h4>
            <div class="timeline-list">
              ${timelineHTML}
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Citizen Discussion (${(issue.comments || []).length})</h4>
            
            <div class="comments-container" id="detail-comments-list">
              ${commentsHTML || '<div style="font-size: 0.8rem; color: var(--text-muted);">No comments yet. Be the first to comment!</div>'}
            </div>

            <!-- Add Comment Form -->
            <form onsubmit="window.submitComment('${issue.id}', event)" style="display: flex; gap: 0.4rem; margin-top: 0.85rem;">
              <input type="text" id="input-new-comment" class="form-input" placeholder="Add a public note or update..." style="font-size: 0.825rem;" required />
              <button type="submit" class="btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.825rem;">Post</button>
            </form>
          </div>
        </div>
      </div>
    `;

    DOM.modalDetailOverlay.classList.add("open");
  };

  window.changeIssueStatus = async function(issueId, newStatus) {
    const statusNote = prompt(`Enter note for status transition to "${newStatus}":`, `Status updated via Municipal Dispatch.`);
    if (statusNote !== null) {
      await window.civicApi.updateStatus(issueId, newStatus, statusNote);
      showToast(`Issue status updated to ${newStatus}!`, "success");
      await reloadData();
      window.viewIssueDetail(issueId);
    }
  };

  window.submitComment = async function(issueId, event) {
    if (event) event.preventDefault();
    const input = document.getElementById("input-new-comment");
    if (!input || !input.value.trim()) return;

    await window.civicApi.addComment(issueId, input.value.trim(), "Civic Volunteer");
    input.value = "";
    showToast("Comment posted!", "success");
    await reloadData();
    window.viewIssueDetail(issueId);
  };

  // --------------------------------------------------------------------------
  // Report Issue Modal & Geolocation Picker
  // --------------------------------------------------------------------------
  function openReportModalWithCoords(lat, lng) {
    state.pickedCoords = {
      lat: lat || APP_CONFIG.MAP_DEFAULTS.DEFAULT_LAT,
      lng: lng || APP_CONFIG.MAP_DEFAULTS.DEFAULT_LNG
    };

    DOM.reportInputLat.value = state.pickedCoords.lat.toFixed(6);
    DOM.reportInputLng.value = state.pickedCoords.lng.toFixed(6);
    DOM.valPickerLat.textContent = state.pickedCoords.lat.toFixed(4);
    DOM.valPickerLng.textContent = state.pickedCoords.lng.toFixed(4);

    if (!DOM.reportInputAddress.value) {
      DOM.reportInputAddress.value = `Near Pin Coordinates (${state.pickedCoords.lat.toFixed(3)}, ${state.pickedCoords.lng.toFixed(3)})`;
    }

    DOM.modalReportOverlay.classList.add("open");

    // Initialize mini picker map after modal animation
    setTimeout(initMiniPickerMap, 200);
  }

  function openReportModal() {
    // Open immediately so reporting is never blocked by an unanswered GPS prompt.
    openReportModalWithCoords();

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (DOM.modalReportOverlay.classList.contains("open")) {
          openReportModalWithCoords(pos.coords.latitude, pos.coords.longitude);
        }
      },
      () => {},
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function initMiniPickerMap() {
    if (typeof L === "undefined") return;

    if (!state.miniPickerMap) {
      state.miniPickerMap = L.map("mini-picker-map", {
        zoomControl: false,
        attributionControl: false
      }).setView([state.pickedCoords.lat, state.pickedCoords.lng], 14);

      L.tileLayer(APP_CONFIG.MAP_DEFAULTS.TILE_LAYER, { maxZoom: 18 }).addTo(state.miniPickerMap);

      state.miniPickerMarker = L.marker([state.pickedCoords.lat, state.pickedCoords.lng], {
        draggable: true
      }).addTo(state.miniPickerMap);

      state.miniPickerMarker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setPickedCoordinates(lat, lng);
      });

      state.miniPickerMap.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setPickedCoordinates(lat, lng);
      });
    } else {
      state.miniPickerMap.invalidateSize();
      state.miniPickerMap.setView([state.pickedCoords.lat, state.pickedCoords.lng], 14);
      if (state.miniPickerMarker) {
        state.miniPickerMarker.setLatLng([state.pickedCoords.lat, state.pickedCoords.lng]);
      }
    }
  }

  function setPickedCoordinates(lat, lng) {
    state.pickedCoords = { lat, lng };
    DOM.reportInputLat.value = lat.toFixed(6);
    DOM.reportInputLng.value = lng.toFixed(6);
    DOM.valPickerLat.textContent = lat.toFixed(4);
    DOM.valPickerLng.textContent = lng.toFixed(4);
    if (state.miniPickerMarker) {
      state.miniPickerMarker.setLatLng([lat, lng]);
    }
  }

  // Geolocation API trigger
  function handleDetectGPS() {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    showToast("Detecting GPS coordinates...", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickedCoordinates(lat, lng);
        if (state.miniPickerMap) state.miniPickerMap.setView([lat, lng], 16);
        DOM.reportInputAddress.value = "Current Device GPS Position";
        showToast("GPS position locked successfully! 🎯", "success");
      },
      (err) => {
        console.warn("GPS error:", err);
        showToast("Could not retrieve GPS coordinates. Please click on map.", "error");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  // Photo Upload Handler (Drag & Drop + Base64 Encoding)
  function handlePhotoSelect(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      state.uploadedPhotoBase64 = e.target.result;
      DOM.photoPreviewElement.src = e.target.result;
      DOM.photoPreviewBox.style.display = "block";
      DOM.reportPhotoDropzone.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  function removeUploadedPhoto() {
    state.uploadedPhotoBase64 = null;
    DOM.photoPreviewElement.src = "";
    DOM.photoPreviewBox.style.display = "none";
    DOM.reportPhotoDropzone.style.display = "flex";
    DOM.reportFileInput.value = "";
  }

  // Quick sample photo helper chips
  function initSamplePhotoChips() {
    if (!DOM.samplePhotosContainer) return;
    const samples = window.SAMPLE_PHOTOS || [];
    DOM.samplePhotosContainer.innerHTML = samples.map(s => `
      <button type="button" class="sample-photo-chip" onclick="window.pickSamplePhoto('${s.url}', '${s.category}')">
        ${s.label}
      </button>
    `).join("");
  }

  window.pickSamplePhoto = function(url, category) {
    state.uploadedPhotoBase64 = url;
    DOM.photoPreviewElement.src = url;
    DOM.photoPreviewBox.style.display = "block";
    DOM.reportPhotoDropzone.style.display = "none";

    // Auto-select corresponding category
    if (category) {
      DOM.reportInputCategory.value = category;
      document.querySelectorAll(".category-radio-card").forEach(c => {
        if (c.dataset.cat === category) c.classList.add("selected");
        else c.classList.remove("selected");
      });
    }
  };

  // --------------------------------------------------------------------------
  // Form Submission (Create New Civic Issue)
  // --------------------------------------------------------------------------
  async function handleReportSubmit(e) {
    e.preventDefault();

    const title = DOM.reportInputTitle.value.trim();
    const desc = DOM.reportInputDesc.value.trim();
    const address = DOM.reportInputAddress.value.trim();
    const category = DOM.reportInputCategory.value;
    const severity = DOM.reportInputSeverity.value;
    const isAnonymous = DOM.reportCheckboxAnon.checked;
    const reporterName = DOM.reportInputName.value.trim();

    if (!title || !desc || !address) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!state.uploadedPhotoBase64) {
      showToast("Please take or upload a photo of the issue.", "error");
      return;
    }

    const newIssuePayload = {
      title,
      description: desc,
      address,
      category,
      severity,
      lat: parseFloat(DOM.reportInputLat.value),
      lng: parseFloat(DOM.reportInputLng.value),
      imageUrl: state.uploadedPhotoBase64 || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      isAnonymous,
      reporterName
    };

    try {
      const created = await window.civicApi.createIssue(newIssuePayload);
      showToast("Civic report submitted successfully! 🚀", "success");

      // Close modal & reset form
      DOM.modalReportOverlay.classList.remove("open");
      DOM.formReportIssue.reset();
      removeUploadedPhoto();

      // Refresh list & pan map to new pin
      await reloadData();
      if (state.map) {
        state.map.setView([created.lat, created.lng], 16);
      }
      
      // Auto open detail view of the freshly created issue
      window.viewIssueDetail(created.id);

    } catch (err) {
      console.error(err);
      showToast("Failed to submit civic report.", "error");
    }
  }

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = "info") {
    if (!DOM.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // Event Listeners Setup
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Theme toggle
    DOM.btnThemeToggle?.addEventListener("click", toggleTheme);

    // Reset Demo Data
    DOM.btnResetDemo?.addEventListener("click", () => {
      if (confirm("Clear all submitted reports?")) {
        window.civicApi.resetToSampleData();
        reloadData();
        showToast("All submitted reports have been cleared.", "info");
      }
    });

    // View Tabs Switching
    DOM.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    // Map Action Buttons
    DOM.btnMapLocateMe?.addEventListener("click", () => centerMapOnLiveLocation(true));

    DOM.btnMapRecenter?.addEventListener("click", () => {
      if (state.map) {
        state.map.setView([APP_CONFIG.MAP_DEFAULTS.DEFAULT_LAT, APP_CONFIG.MAP_DEFAULTS.DEFAULT_LNG], APP_CONFIG.MAP_DEFAULTS.DEFAULT_ZOOM);
      }
    });

    // Feed sort dropdown
    DOM.feedSortSelect?.addEventListener("change", (e) => {
      state.filters.sortBy = e.target.value;
      reloadData();
    });

    // Report Modal Open / Close
    DOM.btnOpenReportModal?.addEventListener("click", openReportModal);
    DOM.btnCloseReportModal?.addEventListener("click", () => DOM.modalReportOverlay.classList.remove("open"));
    DOM.btnCancelReport?.addEventListener("click", () => DOM.modalReportOverlay.classList.remove("open"));

    // Modal Category Selector Cards
    DOM.modalCategorySelector?.addEventListener("click", (e) => {
      const card = e.target.closest(".category-radio-card");
      if (!card) return;
      DOM.modalCategorySelector.querySelectorAll(".category-radio-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      DOM.reportInputCategory.value = card.dataset.cat;
    });

    // Severity Selector Buttons
    DOM.severityPickerGroup?.addEventListener("click", (e) => {
      const btn = e.target.closest(".severity-option-btn");
      if (!btn) return;
      DOM.severityPickerGroup.querySelectorAll(".severity-option-btn").forEach(b => {
        b.className = "severity-option-btn";
      });
      const sev = btn.dataset.severity;
      btn.classList.add(`selected-${sev}`);
      DOM.reportInputSeverity.value = sev;
    });

    // Photo Dropzone
    DOM.reportPhotoDropzone?.addEventListener("click", () => DOM.reportFileInput.click());
    DOM.reportFileInput?.addEventListener("change", (e) => handlePhotoSelect(e.target.files[0]));
    DOM.btnRemovePhoto?.addEventListener("click", removeUploadedPhoto);

    // Drag & Drop
    DOM.reportPhotoDropzone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      DOM.reportPhotoDropzone.classList.add("dragover");
    });
    DOM.reportPhotoDropzone?.addEventListener("dragleave", () => {
      DOM.reportPhotoDropzone.classList.remove("dragover");
    });
    DOM.reportPhotoDropzone?.addEventListener("drop", (e) => {
      e.preventDefault();
      DOM.reportPhotoDropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handlePhotoSelect(e.dataTransfer.files[0]);
      }
    });

    // Detect GPS Button in modal
    DOM.btnReportDetectGps?.addEventListener("click", handleDetectGPS);

    // Form Submit
    DOM.formReportIssue?.addEventListener("submit", handleReportSubmit);

    // Detail Modal Close
    DOM.btnCloseDetailModal?.addEventListener("click", () => DOM.modalDetailOverlay.classList.remove("open"));
    DOM.btnCloseDetailFooter?.addEventListener("click", () => DOM.modalDetailOverlay.classList.remove("open"));

    // Detail Modal Upvote button
    DOM.detailBtnUpvote?.addEventListener("click", () => {
      if (state.selectedIssue) {
        window.handleUpvote(state.selectedIssue.id);
      }
    });

    // Close Modals on Overlay Background Click
    [DOM.modalReportOverlay, DOM.modalDetailOverlay].forEach(overlay => {
      overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
    });
  }

  // Run initial bootstrap
  init();
});
