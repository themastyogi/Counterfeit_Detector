const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized');
} else {
    console.log('⚠️  SendGrid API key not configured');
}

const sendPasswordResetEmail = async (to, resetToken) => {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('❌ Cannot send email: SendGrid not configured');
        return { success: false, message: 'Email service not configured' };
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@veriscan.com',
        subject: 'Password Reset Request - VeriScan',
        text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested to reset your password for your VeriScan account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Password reset email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ SendGrid error:', error.response ? error.response.body : error);
        return { success: false, message: 'Failed to send email' };
    }
};

module.exports = { sendPasswordResetEmail };
