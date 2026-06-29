import { useState } from "react";

const OrderIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

export default function OrderForm({ onLookup }) {
  const [orderId, setOrderId] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!orderId.trim()) return;

    onLookup({ orderId: orderId.trim() });
  };

  return (
    <form className="login-form" onSubmit={submit}>
      <div className="login-form-accent" />

      <div className="login-form-body">

        <div className="input-group">
          <label htmlFor="orderId">Order ID</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <OrderIcon />
            </span>

            <input
              id="orderId"
              type="text"
              placeholder="Enter your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <button type="submit">
          Look Up Order
        </button>

      </div>
    </form>
  );
}
