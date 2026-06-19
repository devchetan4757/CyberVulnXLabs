import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required",
      success: false,
      solved: false
    });
  }

  try {
    // ⚠️ INTENTIONALLY VULNERABLE (SQLi LAB MODE)
    const sql = `
      SELECT * FROM users
      WHERE username = '${username}'
      AND password = '${password}'
    `;

    // ❗ DO NOT pass params here (this is important)
    const result = await pool.query(sql);

    const rows = result.rows;

    if (rows.length > 0) {
      const user = rows[0];

      return res.json({
        success: true,
        solved: user.role === "admin",
        message:
          user.role === "admin"
            ? "Administrator access granted."
            : "Login successful.",
        user: user.username,
        role: user.role
      });
    }

    return res.status(401).json({
      message: "Invalid credentials",
      success: false,
      solved: false
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Internal server error",
      success: false,
      solved: false
    });
  }
});

export default router;
