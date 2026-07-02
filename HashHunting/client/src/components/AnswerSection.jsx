import { useState } from "react";

import AnswerForm from "./AnswerForm";
import AnswerResponse from "./AnswerResponse";
import SuccessBanner from "./SuccessBanner";

const SOLVED_KEY = "cybervulnx-solved";

export default function AnswerSection({ solved, setSolved }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [filenameMatch, setFilenameMatch] = useState(false);
  const [sizeMatch, setSizeMatch] = useState(false);

  const submitAnswer = async ({ filename, size }) => {
    try {
      const res = await fetch(`/api/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ filename, size })
      });

      const data = await res.json();

      setMessage(data.message);
      setSuccess(data.success || false);
      setFilenameMatch(data.filenameMatch || false);
      setSizeMatch(data.sizeMatch || false);

      if (data.solved) {
        localStorage.setItem(SOLVED_KEY, "true");
        setSolved(true);
      } else {
        localStorage.removeItem(SOLVED_KEY);
        setSolved(false);
      }

    } catch (err) {
      setMessage("Unable to connect to server.");
      setSuccess(false);
      setFilenameMatch(false);
      setSizeMatch(false);
    }
  };

  const resetLab = async () => {
    try {
      await fetch(`/api/reset`, {
        method: "POST"
      });
    } catch (err) {
      console.error("Reset failed:", err);
    }

    localStorage.removeItem(SOLVED_KEY);
    setSolved(false);

    setMessage("");
    setSuccess(false);
    setFilenameMatch(false);
    setSizeMatch(false);
  };

  return (
    <section className="login-section">

      {solved && <SuccessBanner />}

      <div className="login-header">
        <h3>Submit Your Answer</h3>

        <button className="reset-btn" onClick={resetLab}>
          Reset Lab
        </button>
      </div>

      <AnswerForm onSubmit={submitAnswer} />

      <AnswerResponse
        message={message}
        success={success}
        solved={solved}
        filenameMatch={filenameMatch}
        sizeMatch={sizeMatch}
      />
    </section>
  );
}
