// ── Terminal.jsx ──────────────────────────────────────────────────────────
// Renders the scrollable output area, the live input row, and the
// mission-failed lock overlay.  Owns NO business logic.

import { useRef, useEffect } from "react";

export default function Terminal({
  lines,
  busy,
  locked,
  prefix,
  sep,
  input,
  onInputChange,
  onCommand, // called with the raw string when Enter is pressed
  onReset,
}) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever output grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, busy]);

  // Keep focus on the terminal input unless locked or busy
  useEffect(() => {
    if (!locked && !busy) {
      inputRef.current?.focus();
    }
  }, [locked, busy]);

  // ── FIX: Use form submit instead of keydown (Android-safe) ───────────────
  function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    const value = input.trim();
    if (value.length === 0) return;

    onCommand(value);
  }

  return (
    <div className="terminal">
      <div ref={scrollRef} className="terminal-output">
        {lines.map((l) => (
          <div key={l.id} className={`term-line term-${l.kind}`}>
            {l.text}
          </div>
        ))}

        {!locked && (
          <div className="terminal-input-row">
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", width: "100%" }}
            >
              <span className="terminal-prompt">
                {prefix}
                <span className="prompt-symbol">{sep}</span>{" "}
              </span>

              <input
                ref={inputRef}
                className="terminal-input"
                value={input}
                disabled={busy}
                onChange={(e) => onInputChange(e.target.value)}
                autoFocus
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="go"
              />
            </form>
          </div>
        )}
      </div>

      {locked && (
        <div className="lock-overlay">
          <div className="lock-icon"></div>
          <div className="lock-title">MISSION FAILED</div>
          <p className="lock-text">
            The sample was executed directly on the host and wiped the
            filesystem. Untrusted files must be detonated inside an isolated
            container first.
          </p>
          <button className="lock-btn" onClick={onReset}>
            ↺ Restart Mission
          </button>
        </div>
      )}
    </div>
  );
}
