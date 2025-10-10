import { z } from "zod";
import { supabase } from "../../config/supabaseClient.js";
import { signJwt } from "../../utils/jwt.js";
import { findUserByEmail, createUser, updateSupabaseAuthPassword, updateStudentPassword, sendResetEmail } from "../../models/student/authModel.js";
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

// Reset Password 
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required.");

    console.log("reset-password called with:", email);
    await sendResetEmail(email);

    res.json({ message: "Password reset email sent!" });
  } catch (err) {
    console.error("reset-password error:", err.message);
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

// Update Password 
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const studentId = req.studentId;
    const userEmail = user.email;

    console.log(" Updating password for:", userEmail);

    // Update in Supabase Auth
    await updateSupabaseAuthPassword(userId, newPassword);

    // Update in students table
    await updateStudentPassword(userEmail, newPassword);

    // Generate JWT login token
    const student = await findUserByEmail(userEmail);
    const loginToken = jwt.sign(
      {
        id: student.student_id,
        username: student.username,
        email: student.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Password updated successfully!",
      token: loginToken,
      user: {
        id: student.student_id,
        username: student.username,
        email: student.email,
      },
    });
  } catch (err) {
    console.error("update-password error:", err.message);
    res.status(400).json({ error: err.message });
  }
};