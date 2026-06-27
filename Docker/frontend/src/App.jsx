import "./App.css";
import { useState } from "react";

import Header from "./components/Header";
import DockerInfo from "./components/DockerInfo";
import DockerLab from "./components/DockerLab";
import Footer from "./components/Footer";

function App() {
  const [solved, setSolved] = useState(
    localStorage.getItem("cybervulnx-docker-solved") === "true"
  );

  return (
    <div className="app">
      <Header solved={solved} />

      <DockerInfo />

      <DockerLab solved={solved} setSolved={setSolved} />

      <Footer />
    </div>
  );
}

export default App;
