// controllers/authController.js
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Pre-hashed once using bcrypt.hash("securePassword123", 10)
    const storedUser = {
      id: "123abc",
      email: "lydia@example.com",
      passwordHash:
        "$2b$10$skVDjeKyC0fsYy0PhqiBI.JTR6CBeAK8/rP3IzWDQ6c9qK3zIN4bO",
    };

    // Check if email matches
    if (email !== storedUser.email) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, storedUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(storedUser.id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: storedUser.id,
        email: storedUser.email,
      },
      token, // return the token to frontend
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};
export const registerUser = (req, res) => {
  res.status(201).json({
    message: "User registered (placeholder)",
  });
};
