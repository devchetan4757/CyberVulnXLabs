export default function InfoSection() {
  return (
    <section className="info-section">

    <div className="intro-meta">
          <span>Threat Intel Practice</span>
         <span>•</span>
         <span>Hash Analysis</span>
       </div>

      <h3>Background: Hash-Based Threat Intelligence</h3>

      <p className="intro-text">
        File hashes are one of the most common identifiers
        used in threat intelligence. Because a hash is a
        fixed-length fingerprint of a file's contents, the
        same file will always produce the same hash no
        matter what it's named or where it's stored, which
        makes hashes useful for tracking a file across
        different systems and reports.
      </p>

      <p className="intro-text">
        A hash on its own doesn't reveal anything about the
        file it came from. What makes it useful is
        cross-referencing it against databases where
        security researchers and vendors have already
        submitted, scanned, and documented files. If a hash
        has been seen before, that record can include the
        filename(s) it was submitted under, its size, file
        type, and analysis results.
      </p>

      <div className="demo-card info-card">
        <span className="demo-title">VirusTotal</span>
        <p className="intro-text">
          A multi-engine scanning platform where files and
          hashes can be looked up to see detection results
          from dozens of antivirus engines, along with
          community comments and behavioral analysis.
        </p>
      </div>

      <div className="demo-card info-card">
        <span className="demo-title">MalwareBazaar</span>
        <p className="intro-text">
          A community-driven repository maintained by
          abuse.ch, focused specifically on cataloging and
          sharing malware samples and their metadata for
          researchers.
        </p>
      </div>


    </section>
  );
}
