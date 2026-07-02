import "./css/AnswerResponse.css";

export default function AnswerResponse({
  message,
  success,
  solved,
  filenameMatch,
  sizeMatch
}) {
  if (!message) return null;

  return (
    <div className="login-response">

      <div
        className={`response-banner ${
          solved ? "success" : "error"
        }`}
      >
        <h3>
          {solved
            ? "Verification Successful"
            : "Verification Failed"}
        </h3>

        <p>{message}</p>
      </div>

      {success && (
        <div className="account-card">

          <div className="account-header">
            Field Check
          </div>

          <div className="account-grid">

            <div className="label">
              File Name
            </div>

            <div
              className={`value role ${
                filenameMatch ? "user" : "admin"
              }`}
            >
              {filenameMatch ? "Correct" : "Incorrect"}
            </div>

            <div className="label">
              File Size
            </div>

            <div
              className={`value role ${
                sizeMatch ? "user" : "admin"
              }`}
            >
              {sizeMatch ? "Correct" : "Incorrect"}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
