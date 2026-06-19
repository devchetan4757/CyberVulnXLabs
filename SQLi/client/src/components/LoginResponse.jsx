import "./css/LoginResponse.css";

export default function LoginResponse({
  message,
  success,
  user,
  role
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
            ? "Authentication Successful"
            : "Authentication Failed"}
        </h3>

        <p>{message}</p>
      </div>

      {success && user && (
        <div className="account-card">

          <div className="account-header">
            Logged In Account
          </div>

          <div className="account-grid">

            <div className="label">
              Username
            </div>

            <div className="value">
              {user}
            </div>

            <div className="label">
              Role
            </div>

            <div
              className={`value role ${
                role === "admin"
                  ? "admin"
                  : "user"
              }`}
            >
              {role}
            </div>

            <div className="label">
              Status
            </div>

            <div className="value">
              Authenticated
            </div>

            <div className="label">
              Access Rights
            </div>

            <div className="value">
              {role === "admin"
                ? "Full Administrative Access"
                : "Limited Member Access"}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
