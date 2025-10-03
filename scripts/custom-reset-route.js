// Custom password reset using Nodemailer (alternative solution)
import jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer.js';

router.post("/custom-reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔔 Custom reset for:", email);

    // Check if user exists in Supabase Auth
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const user = users.users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send email using Nodemailer
    const resetUrl = `${process.env.FRONTEND_URL}/update-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset - Online Learning Platform",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    console.log("✅ Custom reset email sent to:", email);
    res.json({ message: "Password reset email sent!" });

  } catch (err) {
    console.error("❌ Custom reset error:", err);
    res.status(400).json({ error: err.message });
  }
});