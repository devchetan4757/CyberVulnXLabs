import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRoute from "./routes/admin.js";
import resetRoute from "./routes/reset.js";
import submitFlagRoute from "./routes/submitFlag.js";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Capture raw undecoded path before Express touches it
app.use((req, res, next) => {
  req.rawPath = req.url;
  next();
});

app.use("/admin", adminRoute);
app.use("/api/reset", resetRoute);
app.use("/api/submit-flag", submitFlagRoute);

app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("CyberVulnX WAF Bypass Lab running on port", PORT);
});
