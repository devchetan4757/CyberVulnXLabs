import { useState } from "react";

const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
    <path d="M15 2v5h5" />
  </svg>
);

const ScaleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M7 6l-4 6 4 6M17 6l4 6-4 6" />
  </svg>
);

export default function AnswerForm({ onSubmit }) {
  const [filename, setFilename] = useState("");
  const [size, setSize] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!filename.trim() || !size.trim()) return;

    onSubmit({
      filename: filename.trim(),
      size: size.trim()
    });
  };

  return (
    <form className="login-form" onSubmit={submit}>
      <div className="login-form-accent" />

      <div className="login-form-body">

        <div className="input-group">
          <label htmlFor="filename">File Name</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <FileIcon />
            </span>

            <input
              id="filename"
              type="text"
              placeholder="e.g. example_file_name.pdf"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="size">File Size</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <ScaleIcon />
            </span>

            <input
              id="size"
              type="text"
              placeholder="e.g. 18 KB"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <button type="submit">
          Submit Answer
        </button>

      </div>
    </form>
  );
}
