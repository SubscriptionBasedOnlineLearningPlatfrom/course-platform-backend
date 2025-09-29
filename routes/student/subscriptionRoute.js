import express from 'express'
import { checkPaymentActive, confirmCheckout, createCheckoutSession } from '../../controllers/student/subscriptionController.js';
import { studentAuth } from '../../middlewares/authMiddleware.js';

const subscriptionRoute = express.Router();

subscriptionRoute.post('/create-checkout-session',studentAuth, createCheckoutSession);
subscriptionRoute.get('/confirm-checkout/:sessionId',studentAuth, confirmCheckout)
subscriptionRoute.get('/check',studentAuth, checkPaymentActive)

export default subscriptionRoute;