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

exports.sendEmailConfirmation = async (otp, email) => {
  try {
    const mailOptions = {
      from: process.env.LOCKEDIN_EMAIL,
      to: email,
      subject: "verify your account - Lockedin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">🔐 account verification</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request to verify your account. Use the OTP below to verify it. 
          </p>
          <div style="margin: 20px 0; text-align: center;">
            <span style="font-size: 24px; font-weight: bold; color: #222; background: #f3f3f3; padding: 10px 20px; border-radius: 6px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #777;">
            This OTP will expire in 10 minutes. If you didn’t request a verification, you can safely ignore this email.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">- The Lockedin Team</p>
        </div>
      `,
    };

    const emailSent = await transporter.sendMail(mailOptions);

    if (emailSent.messageId) {
      return {
        success: true,
        message: "verify account email sent successfully",
        email,
      };
    } else {
      throw new Error("Failed to send verify account email");
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
};
exports.sendForgotPasswordEmail = async (otp, email) => {
  try {
    const mailOptions = {
      from: process.env.LOCKEDIN_EMAIL,
      to: email,
      subject: "Forgot Your Password? - Lockedin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">🔐 Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Use the OTP below to reset it. 
          </p>
          <div style="margin: 20px 0; text-align: center;">
            <span style="font-size: 24px; font-weight: bold; color: #222; background: #f3f3f3; padding: 10px 20px; border-radius: 6px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #777;">
            This OTP will expire in 10 minutes. If you didn’t request a password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">- The Lockedin Team</p>
        </div>
      `,
    };

    const emailSent = await transporter.sendMail(mailOptions);

    if (emailSent.messageId) {
      return {
        success: true,
        message: "Forgot password email sent successfully",
        email,
      };
    } else {
      throw new Error("Failed to send forgot password email");
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
};
