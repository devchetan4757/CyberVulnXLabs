import "dotenv/config";
import express from "express";
import cors from "cors";

import loginRoute from "./routes/login.js";
import resetRoute from "./routes/reset.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use("/api/login", loginRoute);

app.get((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use("/api/login", loginRoute);
app.use("/api/reset", resetRoute);

app.listen(3000, () => {
  console.log("CyberVulnX SQLi Lab running");
});
