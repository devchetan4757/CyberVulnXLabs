export async function lookupOrder(orderId) {
  const res = await fetch(`/api/order/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "X-User-Id": "3"
    }
  });

  return res.json();
}
