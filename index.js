import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Load env
dotenv.config();

// Create app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use("/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", checkoutRoutes);
app.use("/api", paymentRoutes);

// Root test Route
app.get("/", (req, res) => {
  res.send("Backend root is working");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
