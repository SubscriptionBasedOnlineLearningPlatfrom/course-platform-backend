import { config } from "dotenv";
import jwt from "jsonwebtoken"

config();

export const auth = async (req,res,next) => {
    const header = req.headers.authorization || '';
    const token = header.split(' ')[1];
    config();

    if(!token){
        return res.status(401).json({error: 'Invalid token'});
    }

    const payload = jwt.decode(token);
    req.instructorId = payload.id;
    next();
}

export const studentAuth = (req, res, next) => {
  try {
    // 1) Read token from Authorization header OR cookie (optional)
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");

    const bearerToken =
      scheme === "Bearer" && token ? token : req.cookies?.token; // if you use cookies

    if (!bearerToken) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    // 2) Verify the token (DO NOT use decode for auth)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfig (JWT_SECRET missing)" });
    }

    const payload = jwt.verify(bearerToken, secret);

    // 3) Extract the user id from common claim names
    const studentId =
      payload.id ||           
      payload.user_id ||      
      payload.sub ||          
      payload.user?.id ||     
      null;

    if (!studentId) {
      // Helpful debug: show payload keys so you know where the id actually lives
      return res.status(401).json({
        error: "User id not found in token",
        gotClaims: Object.keys(payload || {}),
      });
    }
    req.studentId = studentId;
    return next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: "Invalid or expired token", details: err.message });
  }
};