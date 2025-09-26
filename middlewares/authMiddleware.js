import { config } from "dotenv";
import jwt from "jsonwebtoken"

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