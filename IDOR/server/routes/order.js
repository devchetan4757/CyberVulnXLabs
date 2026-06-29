import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────
// GET /api/order/:id
//
// Simulated session: the logged-in user's ID is read from the
// X-User-Id request header (set by the client to "3" for alice).
// In a real app this would come from a signed session cookie or JWT.
//
// ⚠️  INTENTIONALLY VULNERABLE (IDOR LAB MODE)
//
// The handler fetches the order row by :id using a parameterised
// query (no SQLi here), but it NEVER checks that the returned
// order.user_id matches the requesting user's ID.
//
// A secure implementation would add:
//
//   AND user_id = $2
//
// to the WHERE clause (or an explicit ownership check after fetch),
// and return 403 Forbidden if the order belongs to someone else.
//
// Because that check is absent, any authenticated user can read any
// other user's order simply by iterating the order ID — that is the
// Insecure Direct Object Reference (IDOR) vulnerability.
// ─────────────────────────────────────────────────────────────────

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Simulated session: trust the header value as the logged-in user.
  const requestingUserId = parseInt(req.headers["x-user-id"], 10);

  if (!requestingUserId) {
    return res.status(401).json({
      message: "Not authenticated.",
      success: false
    });
  }

  // Basic input check — must be a positive integer.
  const orderId = parseInt(id, 10);
  if (isNaN(orderId) || orderId < 1) {
    return res.status(400).json({
      message: "Order ID must be a positive integer.",
      success: false
    });
  }

  try {
    // ✅ Parameterised query — no SQLi vulnerability here.
    // ❌ NO ownership check — the IDOR vulnerability lives here.
    //    The query returns the order for ANY valid order ID,
    //    regardless of which user is asking.
    const result = await pool.query(
      `SELECT
         o.id,
         o.user_id,
         o.item,
         o.amount::numeric::float8  AS amount,
         o.status,
         u.username                 AS owner_username
       FROM orders o
       JOIN users  u ON u.id = o.user_id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No order found with ID ${orderId}.`,
        success: false
      });
    }

    const order = result.rows[0];

    // Detect whether this is an IDOR access (order owned by someone else).
    // This flag is used by the client to mark the lab as solved.
    const isIdor = order.user_id !== requestingUserId;

    return res.json({
      success: true,
      idor: isIdor,
      message: isIdor
        ? `Order #${orderId} retrieved — but it belongs to user "${order.owner_username}", not you!`
        : `Your order #${orderId} retrieved successfully.`,
      order: {
        id: order.id,
        item: order.item,
        amount: order.amount,
        status: order.status,
        owner_username: order.owner_username,
        idor: isIdor
      }
    });

  } catch (err) {
    console.error("Order lookup error:", err);

    return res.status(500).json({
      message: "Internal server error.",
      success: false
    });
  }
});

export default router;
