document.addEventListener("DOMContentLoaded", async () => {
  const isLoginPage = document.body.classList.contains("auth-page");
  const note = document.getElementById("auth-note");
  const setNote = (message, isError = false) => {
    if (!note) return;
    note.textContent = message;
    note.style.color = isError ? "var(--accent-rose)" : "var(--text-muted)";
  };

  if (!window.supabase || !window.APP_CONFIG?.SUPABASE?.URL || !window.APP_CONFIG?.SUPABASE?.PUBLISHABLE_KEY) {
    if (isLoginPage) setNote("Authentication is not configured. Please try again later.", true);
    return;
  }

  const client = window.supabase.createClient(APP_CONFIG.SUPABASE.URL, APP_CONFIG.SUPABASE.PUBLISHABLE_KEY);
  window.civicSupabase = client;
  const { data: { session } } = await client.auth.getSession();

  if (!isLoginPage && !session) {
    window.location.replace("login.html");
    return;
  }
  if (isLoginPage && session) {
    window.location.replace("index.html");
    return;
  }

  const currentUser = session?.user;
  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "Civic Neighbor";
  });

  const authForm = document.getElementById("auth-form");
  const authModeToggle = document.getElementById("auth-mode-toggle");
  const authTitle = document.getElementById("auth-title");
  const authSubtitle = document.getElementById("auth-subtitle");
  const authSubmit = document.getElementById("auth-submit");
  const authNameGroup = document.getElementById("auth-name-group");
  let isSignup = false;

  authModeToggle?.addEventListener("click", () => {
    isSignup = !isSignup;
    authTitle.textContent = isSignup ? "Create your account" : "Welcome back";
    authSubtitle.textContent = isSignup ? "Join your neighborhood civic network." : "Sign in to help improve your city.";
    authSubmit.textContent = isSignup ? "Create account" : "Sign in";
    authModeToggle.textContent = isSignup ? "Already have an account? Sign in" : "New to CivicWatch? Create an account";
    authNameGroup.hidden = !isSignup;
    setNote(isSignup ? "Use at least 6 characters for your password." : "Use your CivicWatch account to continue.");
  });

  authForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("auth-email")?.value.trim();
    const password = authForm.querySelector('input[type="password"]')?.value;
    const name = document.getElementById("auth-name")?.value.trim();
    if (!email || !password) return;
    authSubmit.disabled = true;
    authSubmit.textContent = isSignup ? "Creating account…" : "Signing in…";
    let error, data;
    if (isSignup) ({ data, error } = await client.auth.signUp({ email, password, options: { data: { name: name || "Civic Neighbor" } } }));
    else ({ data, error } = await client.auth.signInWithPassword({ email, password }));
    authSubmit.disabled = false;
    authSubmit.textContent = isSignup ? "Create account" : "Sign in";
    if (error) { setNote(error.message, true); return; }
    if (isSignup && !data.session) { setNote("Account created. Check your email to confirm it, then sign in."); return; }
    window.location.href = "index.html";
  });

  document.getElementById("btn-sign-out")?.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "login.html";
  });
});
