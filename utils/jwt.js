import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signJwt = (payload, options = {}) =>
  jwt.sign(payload, process.env.STUDENT_JWT_SECRET, { expiresIn: "7d", ...options });

export const verifyJwt = (token) => jwt.verify(token, process.env.STUDENT_JWT_SECRET);
