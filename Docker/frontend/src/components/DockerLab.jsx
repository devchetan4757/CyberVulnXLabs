
import { useState, useEffect, useCallback } from "react";
import { freshFS } from "./fs";
import { useCommandHandler, mkLine } from "./useCommandHandler";
import Terminal from "./Terminal";
import FlagForm from "./FlagForm";
import "./css/DockerLab.css";

export default function DockerLab({ solved, setSolved }) {
  // ── stage: "brief" | "desktop" ──────────────────────────────────────────
  const [stage, setStage] = useState("brief");

  // ── filesystem + shell state ─────────────────────────────────────────────
  const [fs,          setFs]          = useState(freshFS);
  const [cwd,         setCwd]         = useState([]);
  const [lines,       setLines]       = useState([]);
  const [input,       setInput]       = useState("");

  // ── docker state ─────────────────────────────────────────────────────────
  const [inDocker,      setInDocker]      = useState(false);
  const [dockerPulled,  setDockerPulled]  = useState(false);
  const [containerId,   setContainerId]   = useState("");

  // ── game state ───────────────────────────────────────────────────────────
  const [locked,    setLocked]    = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [flagFound, setFlagFound] = useState(false);
  const [mistakes,  setMistakes]  = useState(0);
  const [wrongTries,setWrongTries]= useState(0);
  const [score,     setScore]     = useState(null);

  // ── command handler (all shell logic lives here) ─────────────────────────
  const { handleCommand, promptString } = useCommandHandler(
    { fs, cwd, inDocker, dockerPulled, containerId },
    {
      setFs, setCwd, setLines,
      setInDocker, setDockerPulled, setContainerId,
      setFlagFound, setLocked, setMistakes,
    }
  );

  // ── sequential printer (used for boot sequence) ──────────────────────────
  const pushSequential = useCallback(
    (entries, onDone) => {
      setBusy(true);
      let i = 0;
      const step = () => {
        if (i >= entries.length) { setBusy(false); onDone?.(); return; }
        const [text, kind, delay] = entries[i];
        setLines((prev) => [...prev, mkLine(text, kind)]);
        i += 1;
        setTimeout(step, delay ?? 350);
      };
      step();
    },
    []
  );

  // ── boot sequence ────────────────────────────────────────────────────────
  function bootSequence() {
    // FIX: reset solved state when re-initialising the environment
    setSolved(false);
    setStage("desktop");
    pushSequential([
      ["Booting MalwareLab sandbox image...", "sys", 250],
      ["[ OK ] Mounted /home/agent",           "sys", 200],
      ["[ OK ] Network: isolated lab segment", "sys", 200],
      ["[ OK ] Session ready.",                "sys", 250],
      ["Type 'help' to see available commands.", "sys", 250],
    ]);
  }

  // ── full reset ───────────────────────────────────────────────────────────
  async function resetAll() {
    try { await fetch("/api/reset", { method: "POST" }); } catch {}
    setFs(freshFS());
    setCwd([]);
    setLines([]);
    setInput("");
    setInDocker(false);
    setDockerPulled(false);
    setContainerId("");
    setLocked(false);
    setBusy(false);
    setFlagFound(false);
    setMistakes(0);
    setWrongTries(0);
    setScore(null);
    setSolved(false);   // FIX: always clear solved on reset
    setStage("brief");
  }

  // ── flag submission ──────────────────────────────────────────────────────
  async function submitFlag(flagVal) {
    try {
      const res = await fetch("/api/validate-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: flagVal, mistakes, wrongTries }),
      });
      const data = await res.json();
      if (!data.matched) {
        setWrongTries((w) => w + 1);
        return { ok: false, error: "Incorrect flag — keep investigating." };
      }
      setScore(data.score);
      setSolved(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach the lab server — try again." };
    }
  }

  // ── command dispatch wrapper (clears input, feeds handler) ───────────────
  function onCommand(raw) {
    handleCommand(raw);
    setInput("");
  }

  // ── brief screen ─────────────────────────────────────────────────────────
  if (stage === "brief") {
    return (
      <section className="lab-main docker-lab">
        <div className="briefing-card">
          <p className="briefing-desc">
            A phishing email delivered a ZIP file claiming to contain an unpaid
            invoice. Your task is to investigate the archive safely, find the
            hidden flag.
            <br /><br />
            Do not run unverified files directly on the host.
          </p>
          <button className="init-btn" onClick={bootSequence}>
            ▶ Initialize Environment
          </button>
        </div>
      </section>
    );
  }

  // ── desktop / terminal screen ────────────────────────────────────────────
  const { prefix, sep } = promptString();

  return (
    <section className="lab-main docker-lab">
      {/* Status bar */}
      <div className="status-row">
        <span className={`pill ${inDocker ? "pill-container" : "pill-host"}`}>
          ● {inDocker ? "INSIDE CONTAINER (isolated)" : "HOST SHELL (unprotected)"}
        </span>
        {flagFound && !solved && (
          <span className="pill pill-flag">Flag captured — submit it below</span>
        )}
      </div>

      {/* Terminal — completely isolated from FlagForm */}
      <Terminal
        lines={lines}
        busy={busy}
        locked={locked}
        prefix={prefix}
        sep={sep}
        input={input}
        onInputChange={setInput}
        onCommand={onCommand}
        onReset={resetAll}
      />

      {/* Flag form / success banner — separate DOM subtree, no shared form */}
      <FlagForm
        onSubmit={submitFlag}
        solved={solved}
        score={score}
        mistakes={mistakes}
      />
    </section>
  );
}
