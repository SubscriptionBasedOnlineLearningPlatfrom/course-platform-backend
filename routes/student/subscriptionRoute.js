import express from 'express'
import { activeCurrentPlan, checkPaymentActive, confirmCheckout, createCheckoutSession } from '../../controllers/student/subscriptionController.js';
import { studentAuth } from '../../middlewares/authMiddleware.js';

const subscriptionRoute = express.Router();

subscriptionRoute.post('/create-checkout-session',studentAuth, createCheckoutSession);
subscriptionRoute.get('/confirm-checkout/:sessionId',studentAuth, confirmCheckout)
subscriptionRoute.get('/check',studentAuth, checkPaymentActive)
subscriptionRoute.post('/active-plan/:payment_id',studentAuth, activeCurrentPlan)

export default subscriptionRoute;