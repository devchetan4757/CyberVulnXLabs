import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import WafIntro from "./components/WafIntro";
import WafSection from "./components/WafSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("cybervulnx-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />
      <WafIntro />
      <WafSection
        solved={solved}
        setSolved={setSolved}
      />
      <Footer />
    </div>
  );
}

export default App;
