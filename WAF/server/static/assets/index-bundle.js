// CyberVulnX WAF Bypass Lab — built client bundle

const SOLVED_KEY = "cybervulnx-solved";
const root = document.getElementById("root");

let state = {
  solved: localStorage.getItem(SOLVED_KEY) === "true",
  message: "",
  success: false,
  blocked: false,
  html: null,
  path: "/admin"
};

function render() {
  root.innerHTML = `
    <div class="app">
      ${Header(state.solved)}
      ${WafIntro()}
      ${WafSection(state)}
      ${Footer()}
    </div>
  `;
  attachHandlers();
}

function Header(solved) {
  return `
    <header class="header">
      <div class="header-left">
        <img src="/logo.jpg" alt="CyberVulnX" class="club-logo" />
      </div>
      <div class="header-right">
        <div class="lab-title">WAF Bypass Lab</div>
        <div class="lab-status ${solved ? "solved" : ""}">
          <div class="status-box">${solved ? "✓" : ""}</div>
          <span>${solved ? "Solved" : "Not Solved"}</span>
        </div>
      </div>
    </header>
  `;
}

function WafIntro() {
  return `
    <section class="login-intro">
      <div class="intro-meta">
        <span>Internal Portal</span>
        <span>•</span>
        <span>Restricted Access</span>
      </div>

      <h1 class="intro-title">CyberVulnX WAF Bypass</h1>

      <p class="intro-text">
        CyberVulnX runs an internal admin dashboard at <code>/admin</code>.
        A legacy WAF middleware was bolted on to block direct access to it.
      </p>

      <p class="intro-text">
        The WAF performs a simple exact-match check on the raw request path.
        It does not decode, normalize, or lowercase anything — making it
        vulnerable to basic path manipulation techniques.
      </p>

      <p class="intro-text">
        Your goal is to bypass the WAF and successfully load the admin dashboard.
      </p>

      <div class="demo-card">
        <span class="demo-title">Hint</span>
        <div class="demo-row">
          <strong>Blocked</strong>
          <code>/admin</code>
        </div>
        <div class="demo-row">
          <strong>Try instead</strong>
          <code>/%61dmin</code>
        </div>
      </div>
    </section>
  `;
}

function WafSection(state) {
  return `
    <section class="login-section">
      ${state.solved ? SuccessBanner() : ""}

      <div class="login-header">
        <h3>Send Request</h3>
        <button class="reset-btn" id="reset-btn">Reset Lab</button>
      </div>

      ${WafForm(state.path)}
      ${WafResponse(state)}
    </section>
  `;
}

function SuccessBanner() {
  return `
    <div class="success-banner">
      <h3>Challenge Completed</h3>
      <p>WAF bypassed. Admin dashboard accessed.</p>
    </div>
  `;
}

function WafForm(path) {
  return `
    <form class="login-form" id="waf-form">
      <div class="login-form-accent"></div>
      <div class="login-form-body">
        <div class="input-group">
          <label for="reqPath">Request Path</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <input
              id="reqPath"
              type="text"
              placeholder="e.g. /admin"
              value="${escapeHtml(path)}"
              autocomplete="off"
            />
          </div>
        </div>
        <button type="submit">Send Request</button>
      </div>
    </form>
  `;
}

function WafResponse(state) {
  if (!state.message) return "";

  const { message, success, blocked, html } = state;
  const heading = blocked ? "Blocked by WAF" : success ? "Access Granted" : "Request Failed";

  let out = `
    <div class="login-response">
      <div class="response-banner ${success ? "success" : "error"}">
        <h3>${heading}</h3>
        <p>${escapeHtml(message)}</p>
      </div>
  `;

  if (success && html) {
    out += `
      <div class="account-card">
        <div class="account-header">Admin Dashboard</div>
        <div class="admin-content">${html}</div>
      </div>
    `;
  }

  out += `</div>`;
  return out;
}

function Footer() {
  return `
    <footer class="footer">
      <p>CyberVulnX • WAF Bypass Lab</p>
    </footer>
  `;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attachHandlers() {
  const form = document.getElementById("waf-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("reqPath");
      const path = input.value.trim();
      if (!path) return;
      state.path = path;
      await sendRequest(path);
    });
  }

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetLab);
  }
}

async function sendRequest(path) {
  try {
    const res = await fetch(path, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    const data = await res.json();

    state.message = data.message;
    state.success = data.success || false;
    state.blocked = data.blocked || false;
    state.html = data.html || null;

    if (data.solved) {
      localStorage.setItem(SOLVED_KEY, "true");
      state.solved = true;
    }

  } catch (err) {
    state.message = "Unable to connect to server.";
    state.success = false;
    state.blocked = false;
    state.html = null;
  }

  render();
}

async function resetLab() {
  try {
    await fetch("/api/reset", { method: "POST" });
  } catch (err) {
    console.error("Reset failed:", err);
  }

  localStorage.removeItem(SOLVED_KEY);
  state = {
    solved: false,
    message: "",
    success: false,
    blocked: false,
    html: null,
    path: "/admin"
  };

  render();
}

render();
