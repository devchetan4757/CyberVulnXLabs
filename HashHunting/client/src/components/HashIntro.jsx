const CHALLENGE_HASH =
  "43e6dda2af1193356b62650f3a2f7df89fd670daa60a9dd80e605cfe3b4cb53b";

export default function HashIntro() {
  return (
    <section className="login-intro">


      <h1 className="intro-title">
        Hash Identification Lab
      </h1>

      <p className="intro-text">
        Analysts are often handed nothing more than a
        file hash and asked to figure out what it
        belongs to. This lab walks through that
        workflow using a training sample instead of a
        live threat.
      </p>

      <p className="intro-text">
        Below is a SHA-256 hash for a sample file that
        has been indexed in this lab's training
        dataset. Your task is to identify the file's
        original name and its size, then submit both
        for verification.
      </p>

      <div className="demo-card">
        <span className="demo-title">
          Challenge Hash (SHA-256)
        </span>

        <div className="demo-row hash-row">
          <code className="hash-value">
            {CHALLENGE_HASH}
          </code>
        </div>
      </div>


    </section>
  );
}
