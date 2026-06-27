
import { useState } from "react";

export default function FlagForm({ onSubmit, solved, score, mistakes }) {
  const [flagInput, setFlagInput]   = useState("");
  const [flagError, setFlagError]   = useState("");

  async function handleSubmit() {
    const trimmed = flagInput.trim();
    if (!trimmed) return;
    const result = await onSubmit(trimmed);
    if (!result.ok) {
      setFlagError(result.error ?? "Incorrect flag — keep investigating.");
    } else {
      setFlagError("");
    }
  }

  // Enter inside THIS input only triggers flag submit
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  }

  if (solved) {
    return (
      <div className="success-banner">
        <h3>Challenge Complete</h3>
        <ul>
          <li>Identified a mismatched file type before running it.</li>
          <li>Used container isolation to safely detonate the sample.</li>
          <li>Recovered the hidden flag.</li>
        </ul>
        <p className="score-line">
          Score: {score}/100{" "}
          {mistakes > 0 && (
            <span className="score-note">
              (−{mistakes * 30} for {mistakes} host wipe
              {mistakes > 1 ? "s" : ""})
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flag-form">
      <label>⚑ Submit flag</label>
      <div className="flag-row">
        <input
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="FLAG{...}"
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      {flagError && <p className="flag-error">{flagError}</p>}
    </div>
  );
}
