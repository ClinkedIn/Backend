const { v4: uuidv4 } = require("uuid");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.LOCKEDIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const createConfirmationEmail = async (resetURL, email, token) => {
  const mailOptions = {
    from: process.env.LOCKEDIN_EMAIL,
    to: email,
    subject: "Confirm Your Email - Lockedin",
    html: `
      <h2>Email Confirmation</h2>
      <p>Thank you for registering with our Lockedin. Please confirm your email by clicking the link below:</p>
      <a href="${resetURL}"
   onclick="event.preventDefault(); fetch(this.href, {
     method: 'PATCH',
     headers: { 'Content-Type': 'application/json' },
   });">
   Confirm Email
</a>

      <p>Or use this token:</p>
      <p><strong>${token}</strong></p>
      <p>This token will expire in 24 hours.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendEmailConfirmation = async (userId, req) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      throw new Error("user not found");
    }
    if (user.isConfirmed) {
      throw new Error("The email is already confirmed.");
    }
    user.emailVerificationToken = uuidv4(); // can be replaced by crypto.randomBytes(32).toString('hex') for more security
    user.emailVerificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    await user.save();
    const resetURL = `${req.protocol}://${req.get("host")}/user/confirm-email/${
      user.emailVerificationToken
    }`;
    const emailSent = await createConfirmationEmail(
      resetURL,
      user.email,
      user.emailVerificationToken
    );
    if (emailSent.messageId) {
      return {
        success: true,
        message: "Confirmation email sent successfully",
        email: user.email,
        emailVerificationToken: user.emailVerificationToken,
      };
    } else {
      throw new Error("failed to send confirmation email");
      // throw new Error("failed to send confirmation email");
      // Resend Confirmation email 10 times forloop
      // await createConfirmationEmail(user.email, user.emailVerificationToken);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
exports.sendForgotPasswordEmail = async (resetURL, email) => {
  try {
    const mailOptions = {
      from: process.env.LOCKEDIN_EMAIL,
      to: email,
      subject: "Forgot Your Password ? - Lockedin",
      html: `
      <h2>Email reset</h2>
    <p>forgot your password? Submit a patch request with your new password to: ${resetURL} .\n If you didn't forget your password, ignore this email</p>
      <a href="${resetURL}">reset Password</a>`,
    };

    const emailSent = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', emailSent);
    if (emailSent.messageId) {
      return {
        success: true,
        message: "forgot password email sent successfully",
        email,
      };
    } else {
      throw new Error("failed to send forgot password email");
      // Resend Forgot password email 10 times forloop
      // await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
};
