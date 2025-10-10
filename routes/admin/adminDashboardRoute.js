import express from 'express';
import { getAdminDashboard } from '../../controllers/admin/adminDashboardController.js';

const adminDashboardRoute = express.Router();

adminDashboardRoute.get('/',getAdminDashboard);

export default adminDashboardRoute;