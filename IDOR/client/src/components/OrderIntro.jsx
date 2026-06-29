export default function OrderIntro() {
  return (
    <section className="login-intro">

      <div className="intro-meta">
        <span>Shop Portal</span>
        <span>•</span>
        <span>Order Lookup</span>
      </div>

      <h1 className="intro-title">
        CyberVulnX Order Tracker
      </h1>

      <p className="intro-text">
        Welcome to the CyberVulnX member shop. Once you place
        an order, you can look it up here by entering your
        Order ID. Your account session is used to identify
        who you are — no extra password needed.
      </p>

      <p className="intro-text">
        The backend receives your Order ID and returns the
        matching order record from the database. It is
        supposed to verify that the order belongs to the
        currently logged-in user before returning any data.
      </p>

      <p className="intro-text">
        You are logged in as the demo user below. Your own
        order is <strong>Order #3</strong>. Try looking up
        orders belonging to other users.
      </p>

      <div className="demo-card">

        <span className="demo-title">
          Your Order Details
        </span>

        <div className="demo-row">
          <strong>User</strong>
          <code>alice</code>
        </div>

        <div className="demo-row">
          <strong>User ID</strong>
          <code>3</code>
        </div>

        <div className="demo-row">
          <strong>Own Order</strong>
          <code>#3</code>
        </div>

      </div>
    </section>
  );
}
