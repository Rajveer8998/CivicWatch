document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("home-nav");
  document.getElementById("home-menu-toggle")?.addEventListener("click", () => nav.classList.toggle("open"));

  const sections = [...document.querySelectorAll(".home-section[id]")];
  const links = [...document.querySelectorAll(".home-nav-links a")];
  const observer = new IntersectionObserver((entries) => {
    const current = entries.find(entry => entry.isIntersecting);
    if (!current) return;
    links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current.target.id}`));
  }, { rootMargin: "-35% 0px -55%" });
  sections.forEach(section => observer.observe(section));

  document.querySelectorAll(".reveal-on-scroll").forEach(element => {
    new IntersectionObserver((entries, revealObserver) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 }).observe(element);
  });

  document.querySelectorAll(".policy-toggle").forEach(button => button.addEventListener("click", () => {
    const content = button.nextElementSibling;
    button.classList.toggle("open");
    content.hidden = !content.hidden;
  }));
});
