import "./css/LoginResponse.css";

export default function OrderResponse({
  message,
  success,
  order
}) {
  if (!message) return null;

  return (
    <div className="login-response">

      <div
        className={`response-banner ${
          success ? "success" : "error"
        }`}
      >
        <h3>
          {success
            ? "Order Found"
            : "Lookup Failed"}
        </h3>

        <p>{message}</p>
      </div>

      {success && order && (
        <div className="account-card">

          <div className="account-header">
            Order Details
          </div>

          <div className="account-grid">

            <div className="label">
              Order ID
            </div>

            <div className="value">
              #{order.id}
            </div>

            <div className="label">
              Owner
            </div>

            <div
              className={`value role ${
                order.idor ? "admin" : "user"
              }`}
            >
              {order.owner_username}
              {order.idor && " ⚠ not your order"}
            </div>

            <div className="label">
              Item
            </div>

            <div className="value">
              {order.item}
            </div>

            <div className="label">
              Amount
            </div>

            <div className="value">
              ${order.amount}
            </div>

            <div className="label">
              Status
            </div>

            <div className="value">
              {order.status}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
