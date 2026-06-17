import logo from "../static/logo.jpg";

export default function Header({ solved }) {
  return (
    <header className="header">
      <div className="header-left">
        <img
          src={logo}
          alt="CyberVulnX"
          className="club-logo"
        />
      </div>

      <div className="header-right">
        <div className="lab-title">
          Stored XSS Lab
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
