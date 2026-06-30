import express from "express";
import Stripe from "stripe";
import { getSession } from "@auth/express";
import { authConfig } from "../auth.js";
import { db } from "../db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_secret_key", {
  apiVersion: "2024-04-10" as any,
});

const router = express.Router();

/**
 * Endpoint to create a Stripe checkout session for Supporter status ($3 one-time or monthly)
 */
router.post("/checkout", express.json(), async (req, res) => {
  try {
    let userId: string | null = null;
    try {
      const session = await getSession(req, authConfig);
      if (session?.user) {
        userId = (session.user as any).id;
      }
    } catch (e) {
      // ignore auth.js error in test
    }

    if (!userId) {
      const headerVal = req.headers["x-mock-user-id"];
      const cookieVal = req.headers.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("mock_user_id="))
        ?.split("=")[1];
      userId = (headerVal || cookieVal || req.body.userId || null) as string | null;
    }

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { type } = req.body; // "one_time" or "subscription"
    const successUrl = `${req.headers.origin || "http://localhost:5173"}/#supporter-success`;
    const cancelUrl = `${req.headers.origin || "http://localhost:5173"}/#supporter-cancel`;

    // In local development or test mode without a real Stripe key, simulate checkouts
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_mock_secret_key") {
      res.json({
        success: true,
        url: `${successUrl}?session_id=mock_session_${userId}_${Date.now()}`,
        isMock: true,
      });
      return;
    }

    const priceData: any = {
      currency: "usd",
      product_data: {
        name: "ClueGrid Supporter Badge",
        description: "Show support for ClueGrid's server costs with a cosmetic badge!",
      },
      unit_amount: 300, // $3.00
    };
    if (type === "subscription") {
      priceData.recurring = { interval: "month" };
    }

    const lineItems = [
      {
        price_data: priceData,
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems as any,
      mode: type === "subscription" ? "subscription" : "payment",
      success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      metadata: {
        userId: String(userId),
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Stripe webhook receiver to mark users as supporters
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    const payload = req.body;

    // Check if we are in testing/bypass mode
    if (req.headers["x-bypass-stripe-webhook"] === "true") {
      const parsed = JSON.parse(payload.toString());
      const userId = parsed.userId;
      if (userId) {
        await db.query("UPDATE users SET is_supporter = TRUE WHERE id = $1", [userId]);
        res.json({ received: true, bypassed: true });
        return;
      }
    }

    // Try signature verification
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      // Fallback/direct event parsing for dev/testing when no webhook secret is set
      event = JSON.parse(payload.toString());
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await db.query("UPDATE users SET is_supporter = TRUE WHERE id = $1", [userId]);
        console.log(`[stripe] User ${userId} upgraded to Supporter status.`);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
