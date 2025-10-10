import express from 'express';
import { studentAuth } from '../../middlewares/authMiddleware.js';
import { getProfile, uploadProfileImage } from '../../controllers/student/profileController.js';
import { upload } from '../../config/doSpaces.js';

const profileRoute = express.Router();

profileRoute.get('/', studentAuth, getProfile);
profileRoute.post('/upload', studentAuth, upload.single("file"), uploadProfileImage);

export default profileRoute;