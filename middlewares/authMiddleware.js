import { config } from "dotenv";
import jwt from "jsonwebtoken"

export const auth = async (req,res,next) => {
    const header = req.headers.authorization || '';
    // const header = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Y2E3YzYxMC0zYmM5LTQ0OGQtYjk5MC02ZTMxNzQ3ODQ3YjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE3MDA5MjM1MDB9._Fak3_S1gn4tur3_KeY_F0r_ExAmplE"
    const token = header.split(' ')[1];
    config();

    if(!token){
        return res.status(401).json({error: 'Invalid token'});
    }

    // const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    const payload = jwt.decode(token);
    req.instructorId = payload.id;
    next();

}