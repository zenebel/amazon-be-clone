import express from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// Route: GET /products/
router.get("/", getAllProducts);

// Route: GET /products/:id
router.get("/:id", getProductById);

export default router;
