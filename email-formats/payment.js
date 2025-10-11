export const paymentSuccessEmail = (username, planName) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">Payment Successful! ✅</h2>
      
      <p>Hi <strong>${username}</strong>,</p>
      
      <p>We’re happy to inform you that your payment has been processed successfully for the subscription plan:</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 6px; font-size: 18px;">
        💳 <strong>${planName}</strong><br/>
      </div>
      
      <p>Your subscription is now active, and you can enjoy all the benefits and access the content immediately.</p>
      
      <p style="margin-top: 20px;">
        If you have any questions or require support, our team is always here to help.
      </p>
      
      <p style="margin-top: 30px;">Thank you for your payment!<br/>
      <strong>The Online Learning Platform Team</strong></p>
    </div>
  `;
}
