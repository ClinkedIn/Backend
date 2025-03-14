const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.LOCKEDIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.createVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.LOCKEDIN_EMAIL,
        to: email,
        subject: 'Confirm Your Email - Lockedin',
        html: `
      <h1>Email Confirmation</h1>
      <p>Thank you for registering with our Lockedin. Please confirm your email by using the following token:</p>
      <p><strong>${token}</strong></p>
      <p>This token will expire in 24 hours.</p>
    `
    };

    return transporter.sendMail(mailOptions);
};








module.exports = { sendVerificationEmail };