export async function verifyAnswer(filename, size) {
  const res = await fetch('/api/verify', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filename, size })
  });

  return res.json();
}
