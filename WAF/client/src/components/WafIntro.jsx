export default function WafIntro() {
  return (
    <section className="login-intro">

      <div className="intro-meta">
        <span>Internal Portal</span>
        <span>•</span>
        <span>Restricted Access</span>
      </div>

      <h1 className="intro-title">
        CyberVulnX WAF Bypass
      </h1>

      <p className="intro-text">
        CyberVulnX runs an internal admin dashboard at <code>/admin</code>.
        A legacy WAF middleware is protecting it and will block any direct
        request to that path.
      </p>

      <p className="intro-text">
        The WAF is not as smart as it looks. Find a way to reach the admin
        dashboard without triggering the block.
      </p>

      <p className="intro-text">
        Navigate directly to the admin URL in your browser to attempt access.
        The lab will detect when you have successfully bypassed the WAF.
      </p>

    </section>
  );
}
