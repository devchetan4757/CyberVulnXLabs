const SOLVED_KEY = "cybervulnx-solved";

const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");
const labStatus = document.getElementById("labStatus");
const successBanner = document.getElementById("successBanner");
const uploadForm = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const uploadResult = document.getElementById("uploadResult");
const fileInput = document.getElementById("fileInput");
const flagForm = document.getElementById("flagForm");
const flagInput = document.getElementById("flag");
const flagBtn = document.getElementById("flagBtn");
const flagError = document.getElementById("flagError");
const resetBtn = document.getElementById("resetBtn");

function renderSolved(solved) {
  if (solved) {
    labStatus.classList.add("solved");
    statusBox.textContent = "\u2713";
    statusText.textContent = "Solved";
    successBanner.innerHTML = `
      <div class="success-banner">
        <h3>Challenge Completed</h3>
        <p>Upload restriction bypassed. Server compromised.</p>
      </div>`;
    flagForm.style.display = "none";
  } else {
    labStatus.classList.remove("solved");
    statusBox.textContent = "";
    statusText.textContent = "Not Solved";
    successBanner.innerHTML = "";
    flagForm.style.display = "";
  }
}

renderSolved(localStorage.getItem(SOLVED_KEY) === "true");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";
  uploadResult.style.color = "var(--text-secondary)";
  uploadResult.textContent = "";

  try {
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();

    if (data.success) {
      uploadResult.style.color = "#27ae60";
      uploadResult.innerHTML = `Uploaded to <code>${data.path}</code>`;
    } else {
      uploadResult.style.color = "var(--red)";
      uploadResult.textContent = data.message || "Upload failed.";
    }
  } catch (err) {
    uploadResult.style.color = "var(--red)";
    uploadResult.textContent = "Unable to reach the server.";
  }

  uploadBtn.disabled = false;
  uploadBtn.textContent = "Upload";
});

flagForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const flag = flagInput.value.trim();
  if (!flag) return;

  flagBtn.disabled = true;
  flagBtn.textContent = "Checking...";
  flagError.textContent = "";

  try {
    const res = await fetch("/api/submit-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem(SOLVED_KEY, "true");
      renderSolved(true);
    } else {
      flagError.textContent = data.message;
    }
  } catch (err) {
    flagError.textContent = "Unable to connect to server.";
  }

  flagBtn.disabled = false;
  flagBtn.textContent = "Submit Flag";
});

resetBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/reset", { method: "POST" });
  } catch (err) {
    console.error("Reset failed:", err);
  }
  localStorage.removeItem(SOLVED_KEY);
  fileInput.value = "";
  uploadResult.textContent = "";
  flagInput.value = "";
  flagError.textContent = "";
  renderSolved(false);
});
