import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import loginRoute from "./routes/login.js";
import resetRoute from "./routes/reset.js";

const app = express();

app.use(cors());
app.use(express.json());

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use("/api/login", loginRoute);
app.use("/api/reset", resetRoute);

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/dist")));

// fallback route (VERY IMPORTANT)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// use Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(" SQLi Lab running on port", PORT);
});
