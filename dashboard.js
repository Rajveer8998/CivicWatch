document.addEventListener("DOMContentLoaded", async () => {
  if (!window.civicApi) return;
  const issues = await window.civicApi.getIssues({});
  const active = issues.filter(issue => issue.status !== "resolved").length;
  const resolved = issues.filter(issue => issue.status === "resolved").length;
  const endorsements = issues.reduce((total, issue) => total + (issue.upvotes || 0), 0);
  const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  setText("dashboard-total", issues.length);
  setText("dashboard-active", active);
  setText("dashboard-resolved", issues.length ? `${Math.round((resolved / issues.length) * 100)}%` : "0%");
  setText("dashboard-endorsements", endorsements);
  const recent = document.getElementById("dashboard-recent-issues");
  if (recent) recent.innerHTML = issues.slice(0, 3).map(issue => `
    <article class="dashboard-issue-row"><span class="dashboard-issue-icon">${issue.category === "pothole" ? "🚧" : "📍"}</span><div><strong>${issue.title}</strong><span>${issue.address}</span></div><span class="status-badge status-${issue.status}">${issue.status.replace("_", " ")}</span></article>
  `).join("");
});
