import "./App.css";
import { useState } from "react";
import Header from "./components/Header";
import BlogPost from "./components/BlogPost";
import CommentSection from "./components/CommentSection";

function App() {
  const [solved, setSolved] =
    useState(
      localStorage.getItem(
        "xss-solved"
      ) === "true"
    );

  return (
    <div className="app">
      <Header solved={solved} />

      <BlogPost />

      <CommentSection
        solved={solved}
        setSolved={setSolved}
      />
    </div>
  );
}

export default App;
