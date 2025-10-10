import express from 'express';

import { fetchPayments } from '../../controllers/admin/viewPaymentController.js';

const viewPaymentRoute = express.Router();
viewPaymentRoute.get('/', fetchPayments);

export default viewPaymentRoute;