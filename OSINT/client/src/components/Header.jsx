
export default function Header({ solved }) {
  return (
    <header className="header">
      <div className="header-left">
      </div>

      <div className="header-right">
        <div className="lab-title">
          The Haunted Trail — OSINT
        </div>

        <div className={`lab-status ${solved ? "solved" : ""}`}>
          <div className="status-box">
            {solved ? "✓" : ""}
          </div>
          <span>{solved ? "Solved" : "Not Solved"}</span>
        </div>
      </div>
    </header>
  );
}
