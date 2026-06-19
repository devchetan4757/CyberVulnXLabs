import { useState } from "react";

import LoginForm from "./LoginForm";
import LoginResponse from "./LoginResponse";
import SuccessBanner from "./SuccessBanner";

const SOLVED_KEY = "cybervulnx-solved";

export default function LoginSection({ solved, setSolved }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = async (credentials) => {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      setMessage(data.message);
      setSuccess(data.success || false);
      setUser(data.user || null);
      setRole(data.role || null);

      // ✅ ONLY ADMIN SOLVES THE LAB
      if (data.success && data.role === "admin") {
        localStorage.setItem(SOLVED_KEY, "true");
        setSolved(true);
      } else {
        setSolved(false);
      }

    } catch (err) {
      setMessage("Unable to connect to server.");
      setSuccess(false);
      setUser(null);
      setRole(null);
    }
  };

  const resetLab = async () => {
    try {
      await fetch("http://localhost:3000/api/reset", {
        method: "POST"
      });
    } catch (err) {
      console.error("Reset failed:", err);
    }

    localStorage.removeItem(SOLVED_KEY);
    setSolved(false);

    setMessage("");
    setSuccess(false);
    setUser(null);
    setRole(null);
  };

  return (
    <section className="login-section">

      {solved && <SuccessBanner />}

      <div className="login-header">
        <h3>Member Login</h3>

        <button className="reset-btn" onClick={resetLab}>
          Reset Lab
        </button>
      </div>

      <LoginForm onLogin={login} />

      <LoginResponse
        message={message}
        success={success}
        user={user}
        role={role}
      />
    </section>
  );
}
