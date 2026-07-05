import { useState } from "react";
import SuccessBanner from "./SuccessBanner";

const SOLVED_KEY = "cybervulnx-solved";

export default function WafSection({ solved, setSolved }) {
  const [flag, setFlag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFlag = async (e) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submit-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: flag.trim() })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(SOLVED_KEY, "true");
        setSolved(true);
      } else {
        setError(data.message);
      }

    } catch (err) {
      setError("Unable to connect to server.");
    }

    setLoading(false);
  };

  const resetLab = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }
    localStorage.removeItem(SOLVED_KEY);
    setSolved(false);
    setFlag("");
    setError("");
  };

  return (
    <section className="login-section">

      {solved && <SuccessBanner />}

      <div className="login-header">
        <h3>Admin Access</h3>
        <button className="reset-btn" onClick={resetLab}>
          Reset Lab
        </button>
      </div>

      <div className="waf-status-card">
        <div className="waf-status-accent" />
        <div className="waf-status-body">

          <div className="waf-status-row">
            <span className="waf-status-label">Target</span>
            <span className="waf-status-value">/admin</span>
          </div>

          <div className="waf-status-row">
            <span className="waf-status-label">WAF Status</span>
            <span className={`waf-status-value ${solved ? "allowed" : "blocked"}`}>
              {solved ? "Bypassed" : "Blocking"}
            </span>
          </div>

          <div className="waf-status-row">
            <span className="waf-status-label">Instructions</span>
            <span style={{ fontSize: ".9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Bypass the WAF to reach{" "}
              <code style={{ fontFamily: "Consolas,monospace", color: "var(--red)" }}>/admin</code>.
              Find the flag hidden in the page and submit it below.
            </span>
          </div>

        </div>
      </div>

      {!solved && (
        <form className="login-form" onSubmit={submitFlag}>
          <div className="login-form-accent" />
          <div className="login-form-body">

            <div className="input-group">
              <label htmlFor="flag"></label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                </span>
                <input
                  id="flag"
                  type="text"
                  placeholder="CVX{...}"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  autoComplete="off"
                />
              </div>
              {error && (
                <p style={{ color: "var(--red)", fontSize: ".85rem", marginTop: "8px" }}>
                  {error}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Submit Flag"}
            </button>

          </div>
        </form>
      )}

    </section>
  );
}
