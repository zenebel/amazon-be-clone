// routes/checkoutRoutes.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, success_url, cancel_url } = req.body;

    //  Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items array is required and cannot be empty",
      });
    }

    //  Use dynamic URLs from frontend, with fallbacks
    const baseUrl =
      process.env.CLIENT_URL || "https://lydiazenebe.com/amazon-fe-clone";
    const successUrl =
      success_url || `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = cancel_url || `${baseUrl}/cart`;

    console.log("Creating checkout session with:");
    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);
    console.log("Items count:", items.length);

    //  Map items to format Stripe expects with validation
    const lineItems = items.map((item) => {
      const price = Number(item.price);

      if (!price || price <= 0) {
        throw new Error(`Invalid price for item: ${item.name || item.title}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || item.title || "Product",
            description: item.description || undefined,
            // Add product image if available
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(price * 100), // Stripe expects amount in cents
        },
        quantity: item.quantity || 1,
      };
    });

    //  Create checkout session with proper configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,

      //  Additional configuration for better UX
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"], // Add countries as needed
      },

      //  Add metadata for order tracking
      metadata: {
        order_type: "ecommerce",
        total_items: items.length.toString(),
        created_at: new Date().toISOString(),
      },

      //  Session configuration
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes

      //  Payment configuration
      payment_intent_data: {
        metadata: {
          integration_check: "accept_a_payment",
        },
      },
    });

    console.log(" Checkout session created:", session.id);

    res.json({
      id: session.id,
      url: session.url, // Include session URL for debugging
    });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);

    // Better error handling
    if (err.type === "StripeCardError") {
      res.status(400).json({
        error: "Payment processing error",
        details: err.message,
      });
    } else if (err.type === "StripeInvalidRequestError") {
      res.status(400).json({
        error: "Invalid payment request",
        details: err.message,
      });
    } else {
      res.status(500).json({
        error: "Checkout session creation failed",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
});

// Add webhook endpoint for handling payment completion (optional but recommended)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("💰 Payment successful for session:", session.id);

        // Here you would typically:
        // 1. Save order to database
        // 2. Send confirmation email
        // 3. Update inventory
        // 4. Create shipping label

        break;
      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        console.log("❌ Payment failed:", paymentIntent.id);
        break;
      default:
        console.log(`🔔 Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

//  Add session verification endpoint
router.get("/verify-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    console.error("Session verification error:", err);
    res.status(400).json({ error: "Invalid session ID" });
  }
});

export default router;
