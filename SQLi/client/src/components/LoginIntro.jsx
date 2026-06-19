export default function LoginIntro() {
  return (
    <section className="login-intro">

      <div className="intro-meta">
        <span>Club Portal</span>
        <span>•</span>
        <span>Members Only</span>
      </div>

      <h1 className="intro-title">
        CyberVulnX Member Login
      </h1>

      <p className="intro-text">
        Welcome to the CyberVulnX members' portal.
        Club members can securely log in to access
        workshop resources, lab writeups, and event
        updates.
      </p>

      <p className="intro-text">
        This application communicates with a backend
        SQL database to validate usernames and
        passwords before granting access to the
        members' dashboard.
      </p>

      <p className="intro-text">
        Only registered CyberVulnX members should be
        able to authenticate successfully.
      </p>

<div className="demo-card">

  <span className="demo-title">
    Demo Account
  </span>

  <div className="demo-row">
    <strong>Username</strong>
    <code>guest</code>
  </div>

  <div className="demo-row">
    <strong>Password</strong>
    <code>guest123</code>
  </div>

</div>
    </section>
    
  );
}
