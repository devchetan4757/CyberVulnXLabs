import { useState } from "react";
import SuccessBanner from "./SuccessBanner";

const SOLVED_KEY = "osint-solved";

export default function AnswerSection({ solved, setSolved }) {
  const [game, setGame] = useState("");
  const [developer, setDeveloper] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitAnswers = async (e) => {
    e.preventDefault();
    if (!game.trim() || !developer.trim() || !country.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submit-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: game.trim(),
          developer: developer.trim(),
          country: country.trim()
        })
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
    setGame("");
    setDeveloper("");
    setCountry("");
    setError("");
  };

  return (
    <section className="login-section">

      {solved && <SuccessBanner />}

      <div className="login-header">
        <h3>Submit Your Findings</h3>
        <button className="reset-btn" onClick={resetLab}>
          Reset Lab
        </button>
      </div>

      <div className="info-status-card">
        <div className="info-status-accent" />
        <div className="info-status-body">

          <div className="info-status-row">
            <span className="info-status-label">Target</span>
            <span className="info-status-value">ghost.png</span>
          </div>

          <div className="info-status-row">
            <span className="info-status-label">Status</span>
            <span className={`info-status-value ${solved ? "allowed" : "blocked"}`}>
              {solved ? "Identified" : "Unidentified"}
            </span>
          </div>

          <div className="info-status-row">
            <span className="info-status-label">Instructions</span>
            <span style={{ fontSize: ".9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Investigate the image and answer all three
              questions below.
            </span>
          </div>

        </div>
      </div>

      {!solved && (
        <form className="login-form" onSubmit={submitAnswers}>
          <div className="login-form-accent" />
          <div className="login-form-body">

            <div className="input-group">
              <label htmlFor="game">Q1. Game Name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <line x1="6" y1="12" x2="10" y2="12" />
                    <line x1="8" y1="10" x2="8" y2="14" />
                    <line x1="15" y1="11" x2="15.01" y2="11" />
                    <line x1="18" y1="13" x2="18.01" y2="13" />
                  </svg>
                </span>
                <input
                  id="game"
                  type="text"
                  placeholder="Game Name"
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="developer">Q2. Developer</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 18l6-6-6-6" />
                    <path d="M8 6l-6 6 6 6" />
                  </svg>
                </span>
                <input
                  id="developer"
                  type="text"
                  placeholder="Developer Name"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="country">Q3. Country</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
                  </svg>
                </span>
                <input
                  id="country"
                  type="text"
                  placeholder="Country Name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "var(--red)", fontSize: ".85rem" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Submit Answers"}
            </button>

          </div>
        </form>
      )}

    </section>
  );
}
