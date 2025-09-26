import { z } from "zod";
import { supabase } from "../../config/supabaseClient.js";
import { signJwt } from "../../utils/jwt.js";
import { findUserByEmail, createUser } from "../../models/student/authModel.js";

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
    token: z.string().min(10),
    newPassword: z.string().min(6),
});

export const register = async (req, res) => {

    try {
        const { username, email, password } = registerSchema.parse(req.body);

        const existing = await findUserByEmail(email);
        if (existing) return res.status(400).json({ error: "User already exists" });

        const user = await createUser({ username, email, password });
        const token = signJwt({ id: user.instructor_id, username: user.username, email: user.email });

        res.json({ message: "Signup successful", token });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const loginSuccess = async (req, res) => {
    try {
        const user = req.user;
        const token = signJwt({ id: user.instructor_id, username: user.username, email: user.email });
        res.json({ message: "Login successful", token });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        const token = signJwt({ id: user.instructor_id, username: user.username, email: user.email });
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error) {
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
        const { token, newPassword } = updatePasswordSchema.parse(req.body);

        // set a session with the access token
        const { data: session, error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: "",
        });
        if (sessionError) throw sessionError;

        const userId = session?.user?.id;
        if (!userId) throw new Error("Invalid or expired reset token.");

        const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
        if (error) throw error;

        res.json({ message: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
