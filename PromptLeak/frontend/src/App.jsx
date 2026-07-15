import "./App.css";
import { useState } from "react";
import Header from "./components/Header";
import Briefing from "./components/Briefing";
import ChatSection from "./components/ChatSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] =
    useState(
      localStorage.getItem(
        "promptleak-solved"
      ) === "true"
    );

  return (
    <div className="app">
      <Header solved={solved} />

      <Briefing />

      <ChatSection
        solved={solved}
        setSolved={setSolved}
      />

      <Footer />
    </div>
  );
}

export default App;
