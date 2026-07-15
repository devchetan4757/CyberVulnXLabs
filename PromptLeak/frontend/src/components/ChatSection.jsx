import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import ChatBubble from "./ChatBubble";
import SuccessBanner from "./SuccessBanner";

const MESSAGES_KEY = "promptleak-messages";
const SOLVED_KEY = "promptleak-solved";
const FLAG_KEY = "promptleak-flag";

const INTRO_MESSAGE = {
  role: "bot",
  text:
    "Hi, I'm VaultBot. I'm guarding a secret flag for this lab, and I will not be sharing it. " +
    "Feel free to chat with me about anything else!",
};

export default function ChatSection({ solved, setSolved }) {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [flag, setFlag] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [INTRO_MESSAGE];
    const solvedStatus = localStorage.getItem(SOLVED_KEY) === "true";
    const savedFlag = localStorage.getItem(FLAG_KEY) || "";

    setMessages(savedMessages);
    setSolved(solvedStatus);
    setFlag(savedFlag);
  }, [setSolved]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text) => {
    const userMsg = { role: "user", text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const botMsg = { role: "bot", text: data.reply || "..." };
      const withReply = [...updated, botMsg];
      setMessages(withReply);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(withReply));

      if (data.solved) {
        const match = (data.reply || "").match(/CTF\{[^}]*\}/);
        const capturedFlag = match ? match[0] : data.reply;
        localStorage.setItem(SOLVED_KEY, "true");
        localStorage.setItem(FLAG_KEY, capturedFlag);
        setSolved(true);
        setFlag(capturedFlag);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg = { role: "bot", text: "VaultBot couldn't be reached. Try again." };
      const withErr = [...updated, errMsg];
      setMessages(withErr);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(withErr));
    } finally {
      setSending(false);
    }
  };

  const resetLab = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(SOLVED_KEY);
    localStorage.removeItem(FLAG_KEY);
    setSolved(false);
    window.location.reload();
  };

  return (
    <section className="comments-section">
      {solved && <SuccessBanner flag={flag} />}

      <div className="comments-header">
        <h3>Chat with VaultBot</h3>
        <button className="reset-btn" onClick={resetLab}>Reset</button>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.map((m, index) => (
          <ChatBubble key={index} role={m.role} text={m.text} />
        ))}
      </div>

      <ChatInput onSubmit={handleSend} disabled={sending} />
    </section>
  );
}
