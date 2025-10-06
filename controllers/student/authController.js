import { z } from "zod";
import { supabase } from "../../config/supabaseClient.js";
import { signJwt } from "../../utils/jwt.js";
import { findUserByEmail, createUser } from "../../models/student/authModel.js";
import { transporter } from "../../config/nodemailer.js";
import { registerEmail } from "../../email-formats/register.js";

export const registerSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const emailOnlySchema = z.object({
    email: z.email(),
});

export const updatePasswordSchema = z.object({
    studentToken: z.string().min(10),
    newPassword: z.string().min(6),
});

export const register = async (req, res) => {

    try {
        const { username, email, password } = registerSchema.parse(req.body);

        const existing = await findUserByEmail(email);
        if (existing) return res.status(400).json({ error: "User already exists" });

        const student = await createUser({ username, email, password });
        const studentToken = signJwt({ id: student.student_id, username: student.username, email: student.email });

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: student.email,
            subject: 'Registration Successful – Welcome to the Online Learning Platform!',
            html: registerEmail(student.username)
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Signup successful", studentToken });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const loginSuccess = async (req, res) => {
    try {
        const user = req.user;
        const studentToken = signJwt({ id: user.student_id, username: user.username, email: user.email });
        res.json({ message: "Login successful", studentToken });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        console.log(user)
        const studentToken = signJwt({ id: user.student_id, username: user.username, email: user.email });
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?studentToken=${studentToken}`);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const dashboard = async (req, res) => {
    try {
        res.json({ message: `Welcome ${req.user.username}, you are in dashboard!` });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const resetPassword = async (req, res) => {
    try {
        const { email } = emailOnlySchema.parse(req.body);

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/update-password`,
        });
        if (error) throw error;

        res.json({ message: "Password reset email sent!" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const updatePassword = async (req, res) => {
    try {
        const { studentToken, newPassword } = updatePasswordSchema.parse(req.body);

        // set a session with the access studentToken
        const { data: session, error: sessionError } = await supabase.auth.setSession({
            access_studentToken: studentstudentToken,
            refresh_studentstudentToken: "",
        });
        if (sessionError) throw sessionError;

        const userId = session?.user?.id;
        if (!userId) throw new Error("Invalid or expired reset studentToken.");

        const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
        if (error) throw error;

        res.json({ message: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
