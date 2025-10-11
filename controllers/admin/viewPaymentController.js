import { getPaymentDetails } from '../../models/admin/viewPaymentModel.js';

export const fetchPayments = async (req, res) => {
  try {
    const payments = await getPaymentDetails();
    res.status(200).json({ payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment details", error: err.message });
  }
};
