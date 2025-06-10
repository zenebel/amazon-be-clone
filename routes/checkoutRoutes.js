// routes/checkoutRoutes.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Ensure this is set in your .env file

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    // Map items to format Stripe expects
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || item.title,
        },
        unit_amount: Math.round(Number(item.price) * 100), // Stripe expects amount in cents
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://lydiazenebe.com/amazon-fe-clone/success",
      cancel_url: "https://lydiazenebe.com/amazon-fe-clone/cart",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
});

export default router;
