import express from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || item.title,
        },
        unit_amount: Math.round(Number(item.price) * 100), // cents
      },
      quantity: 1,
    })),
    success_url: "http://localhost:5173/amazon-fe-clone/success",
    cancel_url: "http://localhost:5173/amazon-fe-clone/cart",
  });

  res.json({ id: session.id });
});
export default router;
