import express from "express";

const router = express.Router();

// Normalize helper so minor formatting differences
// (spacing, casing) don't fail a correct answer.
function normalize(str = "") {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

router.post("/", (req, res) => {
  const { filename, size } = req.body;

  if (!filename || !size) {
    return res.status(400).json({
      message: "Filename and size are required",
      success: false,
      solved: false
    });
  }

  const correctFilename = normalize(process.env.ANSWER_FILENAME);
  const correctSize = normalize(process.env.ANSWER_SIZE);

  const filenameMatch = normalize(filename) === correctFilename;
  const sizeMatch = normalize(size) === correctSize;

  const solved = filenameMatch && sizeMatch;

  return res.json({
    success: true,
    solved,
    filenameMatch,
    sizeMatch,
    message: solved
      ? "Correct! Both the filename and file size match."
      : "Not quite right. Double-check both fields and try again."
  });
});

export default router;
