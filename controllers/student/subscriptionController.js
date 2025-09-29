import Stripe from "stripe";
import { createEnrollment, createPayment } from "../../models/student/courseModel.js";
import { activeModel } from "../../models/student/subscriptionModel.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { priceId, courseId, plan } = req.body;
        const studentId = req.studentId;

        if (!priceId || !courseId || !plan) {
            return res.status(400).json({ message: "priceId, courseId and plan are required" });
        }


        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            metadata: {
                course_id: String(courseId),
                plan: String(plan),
                student_id: String(studentId),
            },
            success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}`

        })
        res.json({ session_url: session.url })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const confirmCheckout = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const studentId = req.studentId;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription"],
        });

        const isPaid =
            session?.payment_status === "paid" && session?.status === "complete";

        if (!isPaid) {
            return res.status(400).json({ error: "Payment not completed" });
        }
        const { course_id, plan } = session.metadata || {};

        if (!course_id || !studentId) {
            return res.status(400).json({ error: "Missing metadata for enrollment" });
        }

        const enrollment = await createEnrollment(course_id, studentId);
        const payment = await createPayment(studentId, plan, session.subscription?.id);

        return res.status(200).json({
            ok: true,
            enrollment,
            plan,
            customerId: session.customer,
            subscriptionId: session.subscription?.id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// check payment expiry
export const checkPaymentActive = async (req, res) => {
    const studentId = req.studentId;

    const paymentActive = await activeModel(studentId);

    if (!paymentActive || paymentActive.length === 0) {
        return res.json({ has_payment: false, is_active: false });
    }

    const payment = paymentActive[0];
    const createdAt = new Date(payment.created_at);
    const expiryAt = new Date(createdAt);
    expiryAt.setMonth(expiryAt.getMonth() + 1);

    const isActive = expiryAt > new Date();

    return res.json({
        payment,
        expiry_at: expiryAt.toISOString(),
        is_active: isActive,
    });
}
