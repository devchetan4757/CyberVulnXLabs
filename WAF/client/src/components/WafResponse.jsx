import "./css/WafResponse.css";

export default function WafResponse({ status, message, html }) {
  if (!status) return null;

  const success = status === "accessed";

  return (
    <div className="login-response">

      <div className={`response-banner ${success ? "success" : "error"}`}>
        <h3>{success ? "Access Granted" : "Blocked by WAF"}</h3>
        <p>{message}</p>
      </div>

      {success && html && (
        <div className="account-card">
          <div className="account-header">Admin Dashboard</div>
          <div
            className="admin-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

    </div>
  );
}
