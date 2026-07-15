export default function Header({ solved }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="club-logo" role="img" aria-label="lab icon">
          🔐
        </span>
      </div>

      <div className="header-right">
        <div className="lab-title">
          Hash Identification Lab
        </div>

        <div
          className={`lab-status ${
            solved ? "solved" : ""
          }`}
        >
          <div className="status-box">
            {solved ? "✓" : ""}
          </div>

          <span>
            {solved
              ? "Solved"
              : "Not Solved"}
          </span>
        </div>
      </div>
    </header>
  );
}
