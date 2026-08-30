document.addEventListener("DOMContentLoaded", async () => {
  if (!window.civicApi || !window.APP_CONFIG) return;
  const severityOrder = ["critical", "high", "medium", "low"];
  const statusLabels = { reported: "Reported", verified: "Verified", in_progress: "In progress", resolved: "Resolved" };
  let issues = [], selectedSeverity = null;
  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => { const el = byId(id); if (el) el.textContent = value; };
  const percentage = (value, total) => total ? Math.round((value / total) * 100) : 0;

  function renderSummary() {
    const total = issues.length, pending = issues.filter(issue => issue.status !== "resolved").length, resolved = total - pending;
    const last30 = issues.filter(issue => new Date(issue.createdAt).getTime() >= Date.now() - 30 * 86400000).length;
    setText("stats-last-30", last30); setText("stats-total", total); setText("stats-resolved", resolved); setText("stats-pending", pending); setText("stats-chart-total", total); setText("urgency-donut-total", total);
    setText("header-active-count", `${pending} Active Report${pending === 1 ? "" : "s"}`); setText("stats-resolution-note", total ? `${percentage(resolved, total)}% of all reports` : "Successfully closed");
    setText("resolution-rate", `${percentage(resolved, total)}%`); setText("resolution-summary", `${resolved} resolved report${resolved === 1 ? "" : "s"}`); setText("resolution-detail", `${pending} report${pending === 1 ? " is" : "s are"} still in progress or waiting for action.`);
    renderUrgency(total); renderStatuses(total); renderReports();
  }
  function renderUrgency(total) {
    const values = severityOrder.map(level => issues.filter(issue => issue.severity === level).length), colors = severityOrder.map(level => APP_CONFIG.SEVERITY_LEVELS[level].color); let accumulated = 0;
    const segments = values.map((value, index) => { const start = total ? accumulated / total * 100 : 0; accumulated += value; return `${colors[index]} ${start}% ${total ? accumulated / total * 100 : 0}%`; });
    const donut = byId("urgency-donut"); if (donut) donut.style.background = total ? `conic-gradient(${segments.join(", ")})` : "var(--border-color)";
    const legend = byId("urgency-legend"); if (!legend) return;
    legend.innerHTML = severityOrder.map((level, index) => { const definition = APP_CONFIG.SEVERITY_LEVELS[level], count = values[index]; return `<button class="urgency-legend-item ${selectedSeverity === level ? "selected" : ""}" data-severity="${level}" aria-pressed="${selectedSeverity === level}"><span class="urgency-swatch" style="background:${definition.color}"></span><span class="urgency-label"><strong>${definition.label}</strong><small>${definition.desc}</small></span><span class="urgency-value"><strong>${percentage(count, total)}%</strong><small>${count} report${count === 1 ? "" : "s"}</small></span></button>`; }).join("");
    legend.querySelectorAll("[data-severity]").forEach(button => button.addEventListener("click", () => { selectedSeverity = selectedSeverity === button.dataset.severity ? null : button.dataset.severity; renderUrgency(total); renderReports(); }));
  }
  function renderStatuses(total) {
    const counts = APP_CONFIG.STATUS_OPTIONS.map(status => ({ ...status, count: issues.filter(issue => issue.status === status.id).length })), resolved = counts.find(item => item.id === "resolved")?.count || 0;
    const ring = byId("resolution-ring"); if (ring) ring.style.background = `conic-gradient(var(--accent-emerald) ${percentage(resolved, total)}%, var(--border-color) 0)`;
    const box = byId("status-breakdown"); if (box) box.innerHTML = counts.map(status => `<div class="status-breakdown-row"><span><i style="background:${status.color}"></i>${status.label}</span><strong>${status.count}</strong></div>`).join("");
  }
  function renderReports() {
    const matching = selectedSeverity ? issues.filter(issue => issue.severity === selectedSeverity) : issues, list = byId("stats-report-list"), severityLabel = selectedSeverity ? APP_CONFIG.SEVERITY_LEVELS[selectedSeverity].label : "Recent";
    setText("stats-list-title", selectedSeverity ? `${severityLabel} urgency reports` : "Recent city reports"); setText("stats-list-subtitle", selectedSeverity ? `Showing ${matching.length} ${severityLabel.toLowerCase()} urgency report${matching.length === 1 ? "" : "s"}.` : "The latest issues reported by your community.");
    const clear = byId("stats-clear-filter"); if (clear) clear.hidden = !selectedSeverity; if (!list) return;
    if (!matching.length) { list.innerHTML = '<p class="stats-empty">No reports match this urgency level.</p>'; return; }
    list.innerHTML = matching.slice(0, 5).map(issue => { const severity = APP_CONFIG.SEVERITY_LEVELS[issue.severity] || APP_CONFIG.SEVERITY_LEVELS.low, category = APP_CONFIG.CATEGORIES.find(item => item.id === issue.category); return `<a class="stats-report-row" href="feed.html"><span class="stats-report-icon">${category?.icon || "📍"}</span><span class="stats-report-copy"><strong>${issue.title}</strong><small>📍 ${issue.address}</small></span><span class="stats-severity-pill" style="--severity-color:${severity.color}">${severity.label}</span><span class="status-badge status-${issue.status}">${statusLabels[issue.status] || issue.status}</span></a>`; }).join("");
  }
  byId("stats-clear-filter")?.addEventListener("click", () => { selectedSeverity = null; renderSummary(); });
  async function refreshStats() { issues = await window.civicApi.getIssues({}); issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); renderSummary(); }
  window.addEventListener("civicissueschanged", refreshStats);
  await refreshStats();
});
