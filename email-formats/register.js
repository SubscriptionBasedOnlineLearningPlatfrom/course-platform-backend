export const registerEmail =(username) => {
    return( `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">Welcome ${username}! 🎓</h2>
      
      <p><strong>Congratulations!</strong> Your registration on our Education Platform has been completed successfully.</p>
      
      <p>We’re thrilled to have you join our learning community. You can now log in and access courses, resources, and tools designed to support your educational journey.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 6px;">
        ✅ <strong>Your account is now active.</strong><br/>
        🚀 <strong>Start exploring your courses and learning materials today!</strong>
      </div>
      
      <p>If you face any issues logging in, please contact our support team anytime. We’re here to help!</p>
      
      <p style="margin-top: 30px;">Happy Learning,<br/>
      <strong>The Online Learning Platform Team</strong></p>
    </div>
    `)
}