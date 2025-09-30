import express from 'express';
import { studentAuth } from '../../middlewares/authMiddleware.js';
import { getProfile } from '../../controllers/student/profileconroller.js';

const profileRoute = express.Router();

profileRoute.get('/', studentAuth, getProfile);

export default profileRoute;