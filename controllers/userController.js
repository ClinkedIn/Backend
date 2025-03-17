const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const commentModel = require("../models/commentModel");
const repostModel = require("../models/repostModel");
const reportModel = require("../models/reportModel");
const crypto = require("crypto");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  sendEmailConfirmation,
  sendForgotPasswordEmail,
} = require("../utils/emailService");
const {
  validateEmail,
  validatePassword,
} = require("../utils/validateEmailPassword");
const { generateTokens, refreshToken } = require("./jwtController");

const createSendToken = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user, res);

  res.status(statusCode).json({
    status: "success",
    data: {
      accessToken,
      refreshToken,
      user,
    },
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const dummyData = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const getUser = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

// const createUser = async (req, res) => {
//     res.status(200).json({ message: 'Dummy data' });
// };

const sendConnectionRequest = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const acceptConnectionRequest = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const declineConnectionRequest = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const removeConnection = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const addProfilePicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const updateProfilePicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const removeProfilePicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const addCoverPicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const updateCoverPicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const removeCoverPicture = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const addResume = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const updateResume = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const removeResume = async (req, res) => {
  res.status(200).json({ message: "Dummy data" });
};

const registerUser = async (req, res) => {
  try {
    // get registration data
    const { firstName, lastName, email, password, recaptchaResponseToken } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
      //!recaptchaResponseToken
    ) {
      return res.status(400).json({ message: "all fields are required" });
    }
    //validate email format and password requirements
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      return res
        .status(400)
        .json({ message: "Email not valid, Write a valid email" });
    }
    const isValidPassword = validatePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        message:
          "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
      });
    }

    //verify CAPTCHA
    const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaResponseToken}`;
    const captchaResponseData = await axios.post(captchaVerificationUrl);
    if (!captchaResponseData.data.success) {
      return res.status(400).json({
        success: false,
        message: "CAPCHA Verification failed",
      });
    }
    //check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "The User already exist use another email" });
    }

    //Create new User
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      isEmailConfirmed: false,
    });

    // use generateTokens from jwt controller and fix it ✅
    const jwtrefreshToken = generateTokens(newUser, res);

    // remove get confirm-email end point and directly send from here ✅
    const isEmailSent = await sendEmailConfirmation(newUser._id);
    console.log(isEmailSent);
    if (!isEmailSent.success) {
      return res.status(400).json({
        success: false,
        message: isEmailSent.error,
      });
    }
    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to confirm your account.",
      data: {
        token: jwtrefreshToken,
        user: newUser,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Registration failed",
      error: `${error.message}`,
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { emailVerificationToken } = req.params;
    if (!emailVerificationToken) {
      return res.status(400).json({
        success: false,
        message: "Verification Token is required",
      });
    }

    const verificationDate = new Date(Date.now());
    const user = await userModel.findOne({
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiresAt: { $gt: verificationDate },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    user.isConfirmed = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email is confirmed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email confirmation failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "please provide email and password" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "wrong email" });
    }

    const isPasswordValid = await user.correctPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "wrong password" });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.user.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.log(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error("There is no such email address");
      error.statusCode = 404;
      throw error;
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/user/reset-password/${resetToken} `;
    const emailSent = await sendForgotPasswordEmail(resetURL, user.email);

    if (emailSent.success) {
      return res.status(200).json({
        success: true,
        message: "forgot password email sent successfully",
        email: user.email,
      });
    }
    return res.status(500).json({
      success: false,
      message: emailSent.error,
    });
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    //get user based on the token
    const token = req.params.token;
    console.log(token);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: Date.now() },
    });
    // if token is not expired
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }
    // update changedpasswordat
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};

const verifyResetPasswordToken = async (req, res) => {
  try {
    //get user based on the token
    const token = req.params.token;
    //console.log(token);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: Date.now() },
    });
    // if token is not expired
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }
    res.status(200).json({
      status: "success",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    // get the user from the collection
    const user = req.user;
    console.log(user);
    // check if the password is correct
    if (
      !user ||
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res
        .status(401)
        .json({ message: "your current password is wrong" });
    }
    // if so update password
    user.password = req.body.password;
    await user.save();
    // log user in send jwt
    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};

const updateEmail = async (req, res) => {
  try {
    // get the user from the collection
    const user = await userModel.findById(req.user.id);
    const { newEmail, password } = req.body;
    // check if the password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ message: "please enter the correct password" });
    }
    user.email = newEmail;
    user.isConfirmed = false;
    await user.save();
    // log user in send jwt
    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};

const updateName = async (req, res) => {
  try {
    const filteredBody = filterObj(req.body, "firstName", "lastName");
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    createSendToken(updatedUser, 200, res);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  dummyData,
  registerUser,
  confirmEmail,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  deleteUser,
  updateName,
  updateEmail,
  verifyResetPasswordToken,
};
