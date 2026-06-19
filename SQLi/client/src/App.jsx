import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import LoginIntro from "./components/LoginIntro";
import LoginSection from "./components/LoginSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("cybervulnx-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />

      <LoginIntro />

      <LoginSection
        solved={solved}
        setSolved={setSolved}
      />

      <Footer />
    </div>
  );
}

export default App;
