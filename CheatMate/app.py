from flask import Flask, request, jsonify, render_template, url_for
import uuid

app = Flask(__name__)

# In-memory session store: session_id -> game state
GAMES = {}

FLAG = "FLAG{REWARD_haha}"

START_FEN = "3r3k/6pp/8/6N1/8/1Q6/8/2K5 w - - 0 1"
FEN_AFTER_NF7 = "3r3k/5Npp/8/8/8/1Q6/8/2K5 b - - 0 1"       
FEN_AFTER_KG8 = "3r2k1/5Npp/8/8/8/1Q6/8/2K5 w - - 0 1"       
FEN_AFTER_NH6 = "3r2k1/6pp/7N/8/8/1Q6/8/2K5 b - - 0 1"

BRANCH = {
    "f8": {
        "fen_after_king": "3r1k2/6pp/7N/8/8/1Q6/8/2K5 w - - 0 1",
        "bot_move": {"from": "b3", "to": "f7", "san": "Qf7#"},
        "fen_after_bot": "3r1k2/5Qpp/7N/8/8/8/8/2K5 b - - 0 1",
        "mate": True,
        "mate_type": "direct",
        "message": "Queen's Mate",
        "next_legal": [],
    },
    "h8": {
        "fen_after_king": "3r3k/6pp/7N/8/8/1Q6/8/2K5 w - - 0 1",
        "bot_move": {"from": "b3", "to": "g8", "san": "Qg8+"},
        "fen_after_bot": "3r2Qk/6pp/7N/8/8/8/8/2K5 b - - 0 1",
        "mate": False,
        "mate_type": None,
        "message": "The rook has only one legal move",
        "next_legal": ["g8"],
    },
}

SMOTHERED_FINISH = {
    "player_move": {"from": "d8", "to": "g8", "san": "Rxg8"},
    "fen_after_player": "6rk/6pp/7N/8/8/8/8/2K5 w - - 0 1",
    "bot_move": {"from": "h6", "to": "f7", "san": "Nf7#"},
    "fen_after_bot": "6rk/5Npp/8/8/8/8/8/2K5 b - - 0 1",
    "message": "Smothered Mate",
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/start", methods=["POST"])
def start_game():
    """Create a fresh scripted game. Bot is always White, player is always Black.
    The bot plays its opening check (1.Nf7+); everything black does from
    here on — including the forced 1...Kg8 — is a click the player makes."""
    session_id = str(uuid.uuid4())
    GAMES[session_id] = {
        "white": "bot",
        "black": "player",
        "winner_color": "white",
        "claimed": False,
        "state": "await_kg8",
    }
    return jsonify({
        "session_id": session_id,
        "color": "black",
        "start_fen": START_FEN,
        "fen": FEN_AFTER_NF7,
        "bot_move": {"from": "g5", "to": "f7", "san": "Nf7+"},
        "message": "1.Nf7+ — check. The king only has one legal square, but it's your move.",
        "legal_squares": ["g8"],
        "state": "await_kg8",
        "eval_pct": 75,
        "eval_readout": "+5.0",
        "eval_note": "Nf7+",
    })


@app.route("/api/move", methods=["POST"])
def make_move():
    data = request.get_json(force=True, silent=True) or {}
    session_id = data.get("session_id")
    square = data.get("square")

    game = GAMES.get(session_id)
    if not game:
        return jsonify({"error": "invalid or expired session_id"}), 400

    state = game.get("state")

    if state == "await_kg8":
        if square != "g8":
            return jsonify({"error": "illegal move — the king can only go to g8"}), 400

        game["state"] = "await_king_branch"
        return jsonify({
            "player_move": {"from": "h8", "to": "g8", "san": "Kg8"},
            "fen_after_player": FEN_AFTER_KG8,
            "bot_move": {"from": "f7", "to": "h6", "san": "Nh6+"},
            "fen_after_bot": FEN_AFTER_NH6,
            "message": "2.Nh6+!! Double check — the knight checks g8, and moving off f7 uncovers the queen's check along the long diagonal. Where does the king run?",
            "mate": False,
            "mate_type": None,
            "legal_squares": ["f8", "h8"],
            "eval_pct": 85,
            "eval_readout": "+7.4",
            "eval_note": "Forced sequence — one legal move.",
        })

    elif state == "await_king_branch":
        if square not in BRANCH:
            return jsonify({"error": "illegal move — the king can only go to f8 or h8"}), 400

        branch = BRANCH[square]
        game["state"] = "mate" if branch["mate"] else "await_rook"

        if branch["mate"]:
            if branch["mate_type"] == "smothered":
                eval_pct, eval_readout, eval_note = 99, "#0", "Smothered mate — Philidor's Legacy completed. White wins."
            else:
                eval_pct, eval_readout, eval_note = 97, "#0", "Direct mate. White wins."
        else:
            eval_pct, eval_readout, eval_note = 85, "+7.4", "Forced sequence — one legal move."

        return jsonify({
            "player_move": {"from": "g8", "to": square, "san": "K" + square},
            "fen_after_player": branch["fen_after_king"],
            "bot_move": branch["bot_move"],
            "fen_after_bot": branch["fen_after_bot"],
            "message": branch["message"],
            "mate": branch["mate"],
            "mate_type": branch["mate_type"],
            "legal_squares": branch["next_legal"],
            "eval_pct": eval_pct,
            "eval_readout": eval_readout,
            "eval_note": eval_note,
        })

    elif state == "await_rook":
        if square != "g8":
            return jsonify({"error": "illegal move — the rook must recapture on g8, it's the only legal move"}), 400

        game["state"] = "mate"
        finish = SMOTHERED_FINISH
        return jsonify({
            "player_move": finish["player_move"],
            "fen_after_player": finish["fen_after_player"],
            "bot_move": finish["bot_move"],
            "fen_after_bot": finish["fen_after_bot"],
            "message": finish["message"],
            "mate": True,
            "mate_type": "smothered",
            "legal_squares": [],
            "eval_pct": 99,
            "eval_readout": "#0",
            "eval_note": "Smothered mate — Philidor's Legacy completed. White wins.",
        })

    else:
        return jsonify({"error": "game already finished"}), 400


@app.route("/api/claim", methods=["POST"])
def claim_flag():
    data = request.get_json(force=True, silent=True) or {}
    session_id = data.get("session_id")

    game = GAMES.get(session_id)
    if not game:
        return jsonify({"error": "invalid or expired session_id"}), 400

    your_color = "black" if game["black"] == "player" else "white"

    if your_color == game["winner_color"]:
        game["claimed"] = True
        return jsonify({
            "result": "win",
            "flag": FLAG,
            "eval_pct": 3,
            "eval_readout": "+#1",
            "eval_note": "Claim accepted — you are recorded as the winner.",
        })

    return jsonify({"result": "lose", "message": "Checkmate. The bot wins this one."})


@app.route("/api/verify_flag", methods=["POST"])
def verify_flag():
    data = request.get_json(force=True, silent=True) or {}
    submitted = (data.get("flag") or "").strip()

    if submitted and submitted == FLAG:
        return jsonify({
            "correct": True,
            "title": "Congrats!",
            "message": "Correct! That's the real flag.",
            "subtext": "How your request looked hitting our server -",
            "meme_url": url_for("static", filename="meme.jpeg"),
        })

    return jsonify({"correct": False, "message": "Not quite — that flag doesn't match."})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
