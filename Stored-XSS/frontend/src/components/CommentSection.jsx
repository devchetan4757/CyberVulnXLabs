import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import SuccessBanner from "./SuccessBanner";

const COMMENTS_KEY = "comments";
const SOLVED_KEY = "xss-solved";
const ALERTS_KEY = "alerts";

export default function CommentSection({ solved, setSolved }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const defaultComments = [
      { name: "Rahul", comment: "Great workshop. Looking forward to the next session.", date: "06/06/2026" },
      { name: "Priya", comment: "The practical examples were very helpful.", date: "06/06/2026" },
    ];

    const savedComments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || defaultComments;
    const solvedStatus = localStorage.getItem(SOLVED_KEY) === "true";
    const savedAlerts = JSON.parse(localStorage.getItem(ALERTS_KEY)) || [];

    setComments(savedComments);
    setSolved(solvedStatus);

    if (solvedStatus && savedAlerts.length) {
      savedAlerts.forEach((message, index) => {
        setTimeout(() => alert(message), (index + 1) * 300);
      });
    }
  }, [setSolved]);

  const handleCommentSubmit = async (newComment) => {
    const comment = { ...newComment, date: new Date().toLocaleDateString() };
    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));

    try {
      const res = await fetch("/api/validate-payload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment.comment }),
      });

      const data = await res.json();

      if (!data.matched) return;

      if (data.limitReached) {
        alert("Only two successful payloads are allowed.");
        return;
      }

      const alerts = JSON.parse(localStorage.getItem(ALERTS_KEY)) || [];
      const updatedAlerts = [...alerts, data.extracted];
      localStorage.setItem(ALERTS_KEY, JSON.stringify(updatedAlerts));
      localStorage.setItem(SOLVED_KEY, "true");
      setSolved(true);
      alert(data.extracted);

    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  const resetLab = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }
    localStorage.removeItem(COMMENTS_KEY);
    localStorage.removeItem(SOLVED_KEY);
    localStorage.removeItem(ALERTS_KEY);
    setSolved(false);
    window.location.reload();
  };

  return (
    <section className="comments-section">
      {solved && <SuccessBanner />}
      <div className="comments-header">
        <h3>Comments</h3>
        <button className="reset-btn" onClick={resetLab}>Reset</button>
      </div>
      <CommentForm onSubmit={handleCommentSubmit} />
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="empty-comments">No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <CommentCard key={index} name={comment.name} comment={comment.comment} date={comment.date} />
          ))
        )}
      </div>
    </section>
  );
}
