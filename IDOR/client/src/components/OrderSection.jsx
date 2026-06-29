import { useState } from "react";

import OrderForm from "./OrderForm";
import OrderResponse from "./OrderResponse";
import SuccessBanner from "./SuccessBanner";

const SOLVED_KEY = "cybervulnx-solved";

export default function OrderSection({ solved, setSolved }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState(null);

  const lookup = async ({ orderId }) => {
    try {
      const res = await fetch(`/api/order/${encodeURIComponent(orderId)}`, {
        method: "GET",
        headers: {
          // Simulated session header — the server reads this to know who is
          // "logged in". In the real vulnerability the session would come
          // from a cookie; here we keep it simple for the lab.
          "X-User-Id": "3"
        }
      });

      const data = await res.json();

      setMessage(data.message);
      setSuccess(data.success || false);
      setOrder(data.order || null);

      // LAB SOLVED: user accessed an order that doesn't belong to them
      if (data.success && data.idor === true) {
        localStorage.setItem(SOLVED_KEY, "true");
        setSolved(true);
      } else {
        localStorage.removeItem(SOLVED_KEY);
        setSolved(false);
      }

    } catch (err) {
      setMessage("Unable to connect to server.");
      setSuccess(false);
      setOrder(null);
    }
  };

  const resetLab = async () => {
    try {
      await fetch(`/api/reset`, { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }

    localStorage.removeItem(SOLVED_KEY);
    setSolved(false);

    setMessage("");
    setSuccess(false);
    setOrder(null);
  };

  return (
    <section className="login-section">

      {solved && <SuccessBanner />}

      <div className="login-header">
        <h3>Order Lookup</h3>

        <button className="reset-btn" onClick={resetLab}>
          Reset Lab
        </button>
      </div>

      <OrderForm onLookup={lookup} />

      <OrderResponse
        message={message}
        success={success}
        order={order}
      />
    </section>
  );
}
