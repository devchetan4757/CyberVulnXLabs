import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import HashIntro from "./components/HashIntro";
import AnswerSection from "./components/AnswerSection";
import InfoSection from "./components/InfoSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("cybervulnx-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />

      <InfoSection />
       <HashIntro />
      <AnswerSection
        solved={solved}
        setSolved={setSolved}
      />


      <Footer />
    </div>
  );
}

export default App;
