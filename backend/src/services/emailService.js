const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email verification
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Carbonease',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Carbonease</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Carbon Credit Trading Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Carbonease!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Carbonease. To complete your registration and start trading carbon credits, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px; font-size: 14px;">
              This verification link will expire in 24 hours. If you didn't create an account with Carbonease, 
              please ignore this email.
            </p>
          </div>
          
          <div style="background: #343a40; padding: 20px; text-align: center;">
            <p style="color: #adb5bd; margin: 0; font-size: 14px;">
              © 2024 Carbonease. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - Carbonease',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Carbonease</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Carbonease account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px; font-size: 14px;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="background: #343a40; padding: 20px; text-align: center;">
            <p style="color: #adb5bd; margin: 0; font-size: 14px;">
              © 2024 Carbonease. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send transaction confirmation email
  async sendTransactionConfirmation(transaction, user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Transaction Confirmation - ${transaction.transactionRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Carbonease</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Transaction Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Transaction Confirmed!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your carbon credit purchase has been confirmed. Here are the details:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Transaction ID:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${transaction.transactionRef}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Quantity:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${transaction.quantity} credits</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Price per Credit:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">$${transaction.pricePerCredit}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Total Amount:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">$${transaction.totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Status:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #28a745;">${transaction.status.toUpperCase()}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 20px;">
              You can view your transaction details and download certificates from your dashboard.
            </p>
          </div>
          
          <div style="background: #343a40; padding: 20px; text-align: center;">
            <p style="color: #adb5bd; margin: 0; font-size: 14px;">
              © 2024 Carbonease. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Transaction confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending transaction confirmation email:', error);
      throw new Error('Failed to send transaction confirmation email');
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Carbonease!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Carbonease!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your journey to carbon neutrality starts here</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Carbonease, the premier platform for carbon credit trading. 
              You're now part of a community committed to environmental sustainability.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What you can do on Carbonease:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Browse and purchase verified carbon credits</li>
                <li>Track your environmental impact</li>
                <li>Access detailed project information</li>
                <li>Download certificates for your purchases</li>
                ${user.role === 'seller' ? '<li>List and sell your carbon credits</li>' : ''}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #343a40; padding: 20px; text-align: center;">
            <p style="color: #adb5bd; margin: 0; font-size: 14px;">
              © 2024 Carbonease. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Send general notification email
  async sendNotification(email, subject, message, actionUrl = null, actionText = null) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Carbonease</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${message}
            </p>
            
            ${actionUrl && actionText ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" 
                   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 5px; font-weight: bold; display: inline-block;">
                  ${actionText}
                </a>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #343a40; padding: 20px; text-align: center;">
            <p style="color: #adb5bd; margin: 0; font-size: 14px;">
              © 2024 Carbonease. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw new Error('Failed to send notification email');
    }
  }
}

module.exports = new EmailService();
