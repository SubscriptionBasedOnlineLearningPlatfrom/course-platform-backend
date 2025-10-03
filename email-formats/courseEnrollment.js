export const courseEnrollmentEmail = (username, courseName) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">Congratulations, ${username}! 🎉</h2>
      
      <p>We’re excited to inform you that you have <strong>successfully enrolled</strong> in the course:</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 6px; font-size: 18px;">
        📘 <strong>${courseName}</strong>
      </div>
      
      <p>You can now access all course materials, track your progress, and start learning right away.</p>
      
      <p style="margin-top: 20px;">
        If you have any questions or need assistance, feel free to contact our support team anytime.
      </p>
      
      <p style="margin-top: 30px;">Happy Learning,<br/>
      <strong>The Online Learning Platform Team</strong></p>
    </div>
  `;
}


