import express from "express";

const router = express.Router();

const FLAG = "CVX{w4f_byp4ss_succ3ss}";

router.post("/", (req, res) => {
  const { flag } = req.body;

  if (!flag) {
    return res.status(400).json({
      success: false,
      message: "No flag provided."
    });
  }

  if (flag.trim() === FLAG) {
    return res.json({
      success: true,
      message: "Correct. Challenge completed."
    });
  }

  return res.status(401).json({
    success: false,
    message: "Incorrect flag. Keep looking."
  });
});

export default router;
