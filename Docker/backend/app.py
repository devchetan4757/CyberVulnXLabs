from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# ---------------------------------------------------------------------------
# App setup — static_folder points to the React build output
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

lab_state = {
    "solved": False,
    "score": None,
}

# ---------------------------------------------------------------------------
# Expected flag — kept server-side only, never exposed via any API response
# ---------------------------------------------------------------------------
EXPECTED_FLAG = "FLAG{c0nt41n3r_1s0l4t10n_s4v3s_th3_d4y}"

MISTAKE_PENALTY = 30   # per host filesystem wipe
WRONG_TRY_PENALTY = 10  # per incorrect flag submission
MIN_SCORE = 10


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route("/api/validate-flag", methods=["POST"])
def validate_flag():
    """Check a submitted flag against the expected value and score the run."""
    data = request.get_json(silent=True)
    if not data or "flag" not in data:
        return jsonify({"error": "Invalid request"}), 400

    submitted = str(data["flag"]).strip()
    mistakes = int(data.get("mistakes", 0) or 0)
    wrong_tries = int(data.get("wrongTries", 0) or 0)

    if submitted != EXPECTED_FLAG:
        return jsonify({"matched": False})

    score = max(MIN_SCORE, 100 - mistakes * MISTAKE_PENALTY - wrong_tries * WRONG_TRY_PENALTY)

    lab_state["solved"] = True
    lab_state["score"] = score

    return jsonify({"matched": True, "score": score})


@app.route("/api/lab-state", methods=["GET"])
def get_lab_state():
    """Returns current lab state so the frontend can sync on page load."""
    return jsonify({
        "solved": lab_state["solved"],
        "score": lab_state["score"],
    })


@app.route("/api/reset", methods=["POST"])
def reset_lab():
    """Resets the lab back to unsolved state."""
    lab_state["solved"] = False
    lab_state["score"] = None
    return jsonify({"reset": True})


@app.route("/api/health", methods=["GET"])
def health():
    """Health check — useful for Render's uptime monitoring."""
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# Serve React frontend (must be LAST so API routes take priority)
# ---------------------------------------------------------------------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    """
    Serve static React files.
    - If the requested file exists in /dist, return it directly (JS, CSS, images).
    - Otherwise fall back to index.html so React Router handles the route.
    """
    target = os.path.join(app.static_folder, path)
    if path and os.path.exists(target):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
