import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import ChallengeIntro from "./components/ChallengeIntro";
import AnswerSection from "./components/AnswerSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("osint-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />
      <ChallengeIntro />
      <AnswerSection
        solved={solved}
        setSolved={setSolved}
      />
      <Footer />
    </div>
  );
}

export default App;
