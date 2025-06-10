import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user.id, // Comes from decoded token
  });
});

export default router;
