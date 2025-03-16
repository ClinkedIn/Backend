const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.LOCKEDIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const createSendConfirmationEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.LOCKEDIN_EMAIL,
        to: email,
        subject: 'Confirm Your Email - Lockedin',
        html: `
      <h1>Email Confirmation</h1>
      <p>Thank you for registering with our Lockedin. Please confirm your email by clicking the link below:</p>
      <a href="http://localhost:3000/user/confirm-email" 
         onclick="event.preventDefault(); fetch(this.href, { 
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ emailVerificationToken: '${token}' })
         });">
         Confirm Email
      </a>
      <p>Or use this token:</p>
      <p><strong>${token}</strong></p>
      <p>This token will expire in 24 hours.</p>
    `
    };

    return transporter.sendMail(mailOptions);
};

exports.sendEmailConfirmation = async (userId) => {
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            throw new Error("user not found");
        }
        if (user.isConfirmed) {
            throw new Error("The email is already confirmed.");
        }
        user.emailVerificationToken = uuidv4(); // can be replaced by crypto.randomBytes(32).toString('hex') for more security 
        user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);;
        await user.save();

        const emailSent = await createSendConfirmationEmail(user.email, user.emailVerificationToken);
        // console.log('Email sent:', emailSent);
        if (emailSent.messageId) {
            return {
                success: true,
                message: "Confirmation email sent successfully",
                email: user.email,
                emailVerificationToken: user.emailVerificationToken
            };
        }
        else {
            
            // throw new Error("failed to send confirmation email");
            // Resend Confirmation email 10 times forloop
            await createSendConfirmationEmail(user.email, user.emailVerificationToken);
        }
        }

    catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}


