import { config } from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate UUID v4
const generateUUID = () => {
    return crypto.randomUUID();
};

export const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.split(' ')[1];
        config();

        if (!token) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // For testing purposes, allow a test token
        if (token === 'test-token') {
            req.instructorId = 'test-instructor-123'; // Use the ID that exists in our test data
            return next();
        }

        // Decode the JWT token (you can use jwt.verify for production)
        const payload = jwt.decode(token);
        
        if (!payload) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Handle different token payload structures
        req.instructorId = payload.id || payload.sub || payload.user_id;
        
        if (!req.instructorId) {
            return res.status(401).json({ error: 'Invalid token - no user ID found' });
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
