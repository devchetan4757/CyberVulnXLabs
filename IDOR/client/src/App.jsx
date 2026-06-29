import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import OrderIntro from "./components/OrderIntro";
import OrderSection from "./components/OrderSection";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("cybervulnx-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />

      <OrderIntro />

      <OrderSection
        solved={solved}
        setSolved={setSolved}
      />

      <Footer />
    </div>
  );
}

export default App;
