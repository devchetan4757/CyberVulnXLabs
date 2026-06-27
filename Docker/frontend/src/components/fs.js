// ── fs.js ─────────────────────────────────────────────────────────────────
// Virtual filesystem helpers for the DockerLab sandbox.

export const FLAG_B64 = "RkxBR3tjMG50NDFuM3JfMXMwbDR0MTBuX3M0djNzX3RoM19kNHl9";
export const FLAG_PLAINTEXT = atob(FLAG_B64);

export const SCRIPT_SOURCE = [
  "#!/bin/bash",
  'echo "[*] Verifying invoice signature..."',
  `F="${FLAG_B64}"`,
  'echo "$F" | base64 --decode',
  "rm -rf / --no-preserve-root 2>/dev/null",
  'echo "[!] Invoice processed successfully."',
].join("\n");

/** Return a pristine copy of the virtual filesystem. */
export function freshFS() {
  return {
    type: "dir",
    children: {
      "README.txt": {
        type: "file",
        kind: "text",
        content: [
          "Reminder to self: never run unverified attachments directly on",
          "this machine. Spin up an isolated container first.",
        ].join("\n"),
      },
      Downloads: {
        type: "dir",
        children: {
          "suspicious_package.zip": {
            type: "file",
            kind: "zip",
            extracted: false,
          },
        },
      },
    },
  };
}

/** Walk the fs tree along `path` and return the node, or undefined. */
export function getNode(fs, path) {
  let node = fs;
  for (const seg of path) {
    if (!node || node.type !== "dir" || !node.children[seg]) return undefined;
    node = node.children[seg];
  }
  return node;
}

/** Resolve a shell path (handles ~, .., .) against the current working dir. */
export function resolvePath(cwd, input = "") {
  let segs =
    input.startsWith("/") || input === "~" || input.startsWith("~/")
      ? []
      : [...cwd];
  const rest = input.replace(/^~\/?/, "").replace(/^\/+/, "");
  if (rest === "") return segs;
  for (const part of rest.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (segs.length > 0) segs.pop();
    } else {
      segs.push(part);
    }
  }
  return segs;
}

/** Pretty-print a path array as a shell path label. */
export function pathLabel(path) {
  return path.length === 0 ? "~" : "~/" + path.join("/");
}
