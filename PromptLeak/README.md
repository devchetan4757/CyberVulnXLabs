# AI Prompt Injection Lab

A CTF-style lab where an AI assistant ("VaultBot") is told to guard a secret
flag and never reveal it. The user wins by crafting a prompt that gets the
model to leak the flag anyway — classic prompt-injection / jailbreak practice.

Same look, header, and footer as the Stored XSS lab — only the middle section
and lab logic changed.

## Project structure

```
PromptLeak/
├── backend/                 Flask app
│   ├── app.py                /api/chat, /api/lab-state, /api/reset, /api/health
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 React (Vite) app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        same as original lab, new lab title
│   │   │   ├── Footer.jsx        identical to original lab
│   │   │   ├── Briefing.jsx      intro text (was BlogPost)
│   │   │   ├── ChatSection.jsx   chat state + API calls (was CommentSection)
│   │   │   ├── ChatBubble.jsx    one chat message (was CommentCard)
│   │   │   ├── ChatInput.jsx     message box (was CommentForm)
│   │   │   └── SuccessBanner.jsx shows the captured flag
│   │   ├── data/article.jsx      briefing copy
│   │   └── App.jsx / App.css
│   └── package.json
│
└── build.sh
```

## How it works

1. `backend/app.py` keeps a `FLAG` (env var, defaults to a sample value) inside
   a system prompt for VaultBot, along with instructions never to reveal it.
2. Every message you send goes to `/api/chat`, which forwards it to Groq's
   Llama 3.3 70B model along with that system prompt.
3. If the model's reply contains the flag, the backend flips `solved = true`
   and the frontend shows the success banner with the captured flag.
4. "Reset" clears local state and tells the backend to reset `solved`.

## Setup

```bash
# backend
cd backend
cp .env.example .env       
pip install -r requirements.txt
python app.py                # runs on :5000

# frontend (separate terminal)
cd frontend
npm install
npm run dev                  # runs on :5173, proxies /api to :5000
```

Or run `./build.sh` to build the frontend for production and install backend
deps in one go (same as the original lab).

## Difficulty

Medium. VaultBot is instructed to refuse direct asks, refuse roleplay/"dev
mode" framing, and refuse partial/encoded leaks. It's crackable with a solid
prompt-injection technique, not on the first try.

