// ── useCommandHandler.js ──────────────────────────────────────────────────
// Pure command-dispatch logic extracted from DockerLab.
// Returns a single `handleCommand(raw)` function the terminal can call.

import { useCallback } from "react";
import {
  FLAG_PLAINTEXT,
  SCRIPT_SOURCE,
  getNode,
  resolvePath,
  pathLabel,
} from "./fs";

let _lineId = 0;
export const mkLine = (text, kind = "out") => ({ id: ++_lineId, text, kind });

/**
 * @param {object} state  - snapshot of all relevant lab state
 * @param {object} setters - setState functions
 */
export function useCommandHandler(state, setters) {
  const {
    fs,
    cwd,
    inDocker,
    dockerPulled,
    containerId,
  } = state;

  const {
    setFs,
    setCwd,
    setLines,
    setInDocker,
    setDockerPulled,
    setContainerId,
    setFlagFound,
    setLocked,
    setMistakes,
  } = setters;

  // ── helpers ──────────────────────────────────────────────────────────────

  const push = useCallback(
    (text, kind = "out") =>
      setLines((prev) => [...prev, mkLine(text, kind)]),
    [setLines]
  );

  const pushSequential = useCallback(
    (entries, onDone) => {
      let i = 0;
      const step = () => {
        if (i >= entries.length) {
          onDone?.();
          return;
        }
        const [text, kind, delay] = entries[i];
        push(text, kind);
        i += 1;
        setTimeout(step, delay ?? 350);
      };
      step();
    },
    [push]
  );

  function updateNode(path, updater) {
    setFs((prevFs) => {
      const clone = JSON.parse(JSON.stringify(prevFs));
      let node = clone;
      for (const seg of path) node = node.children[seg];
      updater(node);
      return clone;
    });
  }

  function promptString() {
    const path = inDocker ? "/data" : pathLabel(cwd);
    const user = inDocker
      ? `root@${containerId.slice(0, 12)}`
      : "agent@malwarelab-host";
    const sep = inDocker ? "#" : "$";
    return { prefix: `${user}:${path}`, sep };
  }

  // ── malware execution ────────────────────────────────────────────────────
function runHostCrash() {
  pushSequential(
    [
      ["[*] Launching PDF renderer...", "out", 300],
      ["[*] Loading embedded objects...", "out", 300],
      ["[*] Executing /usr/bin/pdf-parser...", "sys", 300],
      ["WARNING: malformed stream object detected", "err", 250],
      ["Segmentation fault (core dumped)", "err", 300],
      ["[*] Kernel memory corruption detected", "err", 300],
      ["[*] Attempting recovery...", "sys", 300],
      ["CRITICAL: init process unstable", "err", 300],
      ["SYSTEM FAILURE", "err", 200],
    ],
    () => {
      setLocked(true);
      setMistakes((m) => m + 1);
    }
  );
}

  function runMalware(viaDocker) {
    if (viaDocker) {
      pushSequential(
        [
          ["[*] Verifying invoice signature...", "out", 400],
          [FLAG_PLAINTEXT, "flag", 500],
          ["[!] Invoice processed successfully.", "out", 300],
        ],
        () => setFlagFound(true)
      );
    } else {
      pushSequential(
        [
          ["[*] Verifying invoice signature...", "out", 350],
          ["Removing /etc ...", "err", 250],
          ["Removing /usr/bin ...", "err", 200],
          ["Removing /home/agent ...", "err", 200],
          ["Removing /var/log ...", "err", 200],
          ["rm: cannot remove '/proc/1': Operation not permitted", "err", 250],
          ["Filesystem integrity: CRITICAL", "err", 350],
          ["Kernel panic - not syncing: Attempted to kill init!", "err", 400],
        ],
        () => {
          setLocked(true);
          setMistakes((m) => m + 1);
        }
      );
    }
  }

  // ── main dispatch ────────────────────────────────────────────────────────

  const handleCommand = useCallback(
    (raw) => {
      const trimmed = raw.trim();
      const { prefix, sep } = promptString();
      push(`${prefix}${sep} ${raw}`, "in");
      if (!trimmed) return;

      // special: echo "..." | base64 --decode
      const b64 = trimmed.match(
        /^echo\s+"?([A-Za-z0-9+/=]+)"?\s*\|\s*base64\s+(?:-d|--decode)\s*$/
      );
      if (b64) {
        try {
          const decoded = atob(b64[1]);
          const isFlag = decoded.includes("FLAG{");
          push(decoded, isFlag ? "flag" : "out");
          if (isFlag) setFlagFound(true);
        } catch {
          push("base64: invalid input", "err");
        }
        return;
      }

      const [cmd, ...rest] = trimmed.split(/\s+/);

      switch (cmd) {
        case "help":
          push(
            [
              "Available commands:",
              "  ls [-la] [path]      list directory contents",
              "  cd <path>             change directory",
              "  pwd                   print working directory",
              "  cat <file>            print file contents",
              "  file <file>           identify file type",
              "  strings <file>        print printable strings",
              "  unzip <file>          extract a zip archive",
              "  chmod +x <file>       mark a file executable",
              "  ./<file> | sh <file> | bash <file>   run a file",
              "  docker run ...        start an isolated container",
              "  docker ps             list running containers",
              "  whoami / hostname     identity info",
              "  clear                 clear the screen",
            ].join("\n")
          );
          break;

        case "pwd":
          push(
            "/home/agent" + (cwd.length ? "/" + cwd.join("/") : "")
          );
          break;

        case "whoami":
          push(inDocker ? "root" : "agent");
          break;

        case "hostname":
          push(
            inDocker ? containerId.slice(0, 12) : "malwarelab-host"
          );
          break;

        case "clear":
          setLines([]);
          break;

        case "ls": {
          let target = cwd;
          const pathArg = rest.find((a) => !a.startsWith("-"));
          const showLong =
            rest.includes("-la") || rest.includes("-l");
          if (pathArg) target = resolvePath(cwd, pathArg);
          const node = getNode(fs, target);
          if (!node || node.type !== "dir") {
            push(
              `ls: cannot access '${pathArg}': No such file or directory`,
              "err"
            );
            break;
          }
          const names = Object.keys(node.children);
          if (names.length === 0) {
            push("");
            break;
          }
          push(
            names
              .map((n) => {
                const c = node.children[n];
                const isDir = c.type === "dir";
                if (!showLong) return isDir ? n + "/" : n;
                const perm = isDir
                  ? "drwxr-xr-x"
                  : c.executable
                  ? "-rwxr-xr-x"
                  : "-rw-r--r--";
                return `${perm}  agent agent  ${isDir ? n + "/" : n}`;
              })
              .join("\n")
          );
          break;
        }

        case "cd": {
          const dest = resolvePath(cwd, rest[0] || "~");
          const node = getNode(fs, dest);
          if (rest[0] && (!node || node.type !== "dir")) {
            push(`cd: ${rest[0]}: No such file or directory`, "err");
            break;
          }
          setCwd(dest);
          break;
        }

        case "cat": {
          if (!rest[0]) {
            push("cat: missing file operand", "err");
            break;
          }
          const target = resolvePath(cwd, rest[0]);
          const node = getNode(fs, target);
          if (!node) {
            push(`cat: ${rest[0]}: No such file or directory`, "err");
            break;
          }
          if (node.type === "dir") {
            push(`cat: ${rest[0]}: Is a directory`, "err");
            break;
          }
          if (node.kind === "zip") {
            push(
              `cat: ${rest[0]}: binary file matches (try 'file' or 'unzip')`,
              "err"
            );
            break;
          }

         if (node.kind === "pdf") {
  if (!inDocker) {
    runHostCrash();
    break;
  }
  runMalware(true);
  break;
}
          push(node.content);
          break;
        }

        case "open":
        case "xdg-open":
        case "evince":
        case "okular":
        case "mupdf": {
          if (!rest[0]) {
            push(`${cmd}: missing operand`, "err");
            break;
          }
          const target = resolvePath(cwd, rest[0]);
          const node = getNode(fs, target);
          if (!node || node.type === "dir") {
            push(
              `${cmd}: ${rest[0]}: No such file or directory`,
              "err"
            );
            break;
          }

          if (node.kind === "pdf" || rest[0].endsWith(".pdf")) {
  if (!inDocker) {
    runHostCrash();
    break;
  }
  runMalware(true);
  break;
}
          push(`(nothing happens)`);
          break;
        }

        case "file": {
          if (!rest[0]) {
            push("file: missing operand", "err");
            break;
          }
          const target = resolvePath(cwd, rest[0]);
          const node = getNode(fs, target);
          if (!node) {
            push(
              `file: cannot open '${rest[0]}' (No such file or directory)`,
              "err"
            );
            break;
          }
          if (node.type === "dir") {
            push(`${rest[0]}: directory`);
            break;
          }
          if (node.kind === "zip") {
            push(`${rest[0]}: Zip archive data`);
            break;
          }
          if (node.kind === "pdf") {
            push(
              `${rest[0]}: Bourne-Again shell script, ASCII text executable`
            );
            push(
              `note: extension is '.pdf' but content type is a shell script — mismatch.`,
              "sys"
            );
            break;
          }
          push(`${rest[0]}: ASCII text`);
          break;
        }

        case "strings": {
          if (!rest[0]) {
            push("strings: missing operand", "err");
            break;
          }
          const target = resolvePath(cwd, rest[0]);
          const node = getNode(fs, target);
          if (
            !node ||
            node.type !== "file" ||
            (node.kind !== "text" && node.kind !== "pdf")
          ) {
            push(
              `strings: ${rest[0]}: No such file or directory`,
              "err"
            );
            break;
          }
          push(node.content);
          break;
        }

        case "unzip": {
          if (!rest[0]) {
            push("unzip: missing operand", "err");
            break;
          }
          const target = resolvePath(cwd, rest[0]);
          const node = getNode(fs, target);
          if (!node || node.kind !== "zip") {
            push(
              `unzip: cannot find or open ${rest[0]}`,
              "err"
            );
            break;
          }
          if (node.extracted) {
            push("Archive already extracted (see 'ls').", "sys");
            break;
          }
          push(
            `Archive:  ${rest[0]}\n  inflating: invoice_2026.pdf`
          );
          updateNode(target.slice(0, -1), (dirNode) => {
            dirNode.children[
              target[target.length - 1]
            ].extracted = true;
            dirNode.children["invoice_2026.pdf"] = {
              type: "file",
              kind: "pdf",
              content: SCRIPT_SOURCE,
              executable: false,
              malware: true,
            };
          });
          break;
        }

        case "chmod": {
          const flagArg = rest[0];
          const fileArg = rest[1];
          if (
            !flagArg ||
            !fileArg ||
            !/^(\+x|7[0-7][0-7]|u\+x)$/.test(flagArg)
          ) {
            push("chmod: usage: chmod +x <file>", "err");
            break;
          }
          const target = resolvePath(cwd, fileArg);
          const node = getNode(fs, target);
          if (!node || node.type !== "file") {
            push(
              `chmod: cannot access '${fileArg}': No such file or directory`,
              "err"
            );
            break;
          }
          updateNode(target.slice(0, -1), (dirNode) => {
            dirNode.children[target[target.length - 1]].executable = true;
          });
          break;
        }

        case "docker": {
          const sub = rest[0];
          if (sub === "run") {
            if (inDocker) {
              push(
                "docker: Cannot connect to the Docker daemon. Is the docker daemon running?",
                "err"
              );
              break;
            }
            const seq = [];
            if (!dockerPulled) {
              seq.push(
                [
                  "Unable to find image 'alpine:latest' locally",
                  "sys",
                  300,
                ],
                [
                  "latest: Pulling from library/alpine",
                  "sys",
                  250,
                ],
                ["a1b2c3d4e5f6: Pull complete", "sys", 250],
                [
                  "Status: Downloaded newer image for alpine:latest",
                  "sys",
                  300,
                ]
              );
            }
            const id = [...Array(64)]
              .map(
                () =>
                  "0123456789abcdef"[Math.floor(Math.random() * 16)]
              )
              .join("");
            seq.push([`Container ${id.slice(0, 12)} started.`, "sys", 300]);
            pushSequential(seq, () => {
              setDockerPulled(true);
              setInDocker(true);
              setContainerId(id);
            });
          } else if (sub === "ps") {
            push(
              inDocker
                ? `CONTAINER ID   IMAGE     STATUS\n${containerId.slice(0, 12)}   alpine    Up (this session)`
                : "CONTAINER ID   IMAGE     STATUS"
            );
          } else if (sub === "images") {
            push(
              dockerPulled
                ? "REPOSITORY   TAG      IMAGE ID\nalpine       latest   a1b2c3d4e5f6"
                : "REPOSITORY   TAG      IMAGE ID"
            );
          } else {
            push(`docker: '${sub}' is not a docker command.`, "err");
          }
          break;
        }

        case "exit": {
          if (inDocker) {
            push("[container removed — --rm]", "sys");
            setInDocker(false);
            setContainerId("");
          } else {
            push(
              "There's nowhere else to go. Use Reset Mission to start over.",
              "sys"
            );
          }
          break;
        }

        default: {
          let target = null;
          let requiresExec = false;
          if (cmd.startsWith("./")) {
            target = resolvePath(cwd, cmd.slice(2));
            requiresExec = true;
          } else if (cmd === "sh" || cmd === "bash") {
            target = resolvePath(cwd, rest[0] || "");
          }
          if (target) {
            const node = getNode(fs, target);
            if (!node || node.type !== "file") {
              push(`${cmd}: No such file or directory`, "err");
              break;
            }
            if (requiresExec && !node.executable) {
              push(`bash: ${cmd}: Permission denied`, "err");
              break;
            }
            if (!node.malware) {
              push("(nothing happens)");
              break;
            }
            runMalware(inDocker);
            break;
          }
          push(`bash: ${cmd}: command not found`, "err");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fs, cwd, inDocker, dockerPulled, containerId, push, pushSequential]
  );

  return { handleCommand, promptString };
}
