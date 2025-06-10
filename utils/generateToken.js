import jwt from "jsonwebtoken";

// Utility function to sign a JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

export default generateToken;
