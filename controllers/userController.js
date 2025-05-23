const userModel = require("../models/userModel");
const crypto = require("crypto");
const firebaseAdmin = require("./../utils/firebase");
const {
  sendEmailConfirmation,
  sendForgotPasswordEmail,
} = require("../utils/emailService");
const {
  validateEmail,
  validatePassword,
} = require("../utils/validateEmailPassword");
const { verifyCaptcha } = require("../utils/verifyCaptcha");
const { generateTokens } = require("./../middlewares/auth");
const jwt = require("jsonwebtoken");
const createSendToken = (user, statusCode, res, responseMessage) => {
  generateTokens(user, res);

  return res.status(statusCode).json({
    status: "success",
    message: responseMessage,
  });
};

const registerUser = async (req, res) => {
  try {
    // get registration data
    let {
      firstName,
      lastName,
      email,
      password,
      recaptchaResponseToken,
      fcmToken,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !recaptchaResponseToken
    ) {
      return res.status(400).json({ message: "all fields are required" });
    }
    email = email.toLowerCase();
    //validate email format and password requirements
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      return res
        .status(422)
        .json({ message: "Email not valid, Write a valid email" });
    }
    const isValidPassword = validatePassword(password);
    if (!isValidPassword) {
      return res.status(422).json({
        message:
          "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
      });
    }

    // //verify CAPTCHA

    const captchaResponse = await verifyCaptcha(recaptchaResponseToken);

    if (!captchaResponse) {
      return res.status(422).json({
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    //check if user already exists
    const existingUser = await userModel.findOne({ email, isActive: true });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "The User already exist use another email" });
    }
    const deactivatedUser = await userModel.findOne({ email, isActive: false });
    if (deactivatedUser) {
      await userModel.deleteOne({ email });
    }

    const fcmTokens = [];
    if (fcmToken) {
      fcmTokens.push(fcmToken);
    }

    //Create new User
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      isConfirmed: false,
      fcmToken: fcmTokens,
    });

    // remove get confirm-email end point and directly send from here ✅

    try {
      const otp = newUser.createEmailVerificationOTP();
      console.log("otp", otp);
      await sendEmailConfirmation(otp, newUser.email);
      await newUser.save({ validateBeforeSave: false });
    } catch (err) {
      console.log("Mail sending failed", err);
    }

    createSendToken(
      newUser,
      201,
      res,
      "User registered successfully. Please check your email to confirm your account."
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Registration failed",
      error: `${error.message}`,
    });
  }
};

const resendConfirmationEmail = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (user.isConfirmed) {
      return res.status(400).json({ message: "User is already confirmed!!" });
    }
    const otp = user.createEmailVerificationOTP();
    await user.save({ validateBeforeSave: false });
    await sendEmailConfirmation(otp, user.email);

    res.status(200).json({
      success: true,
      message:
        "Email sent successfully.  Please check your email to confirm your account.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const verificationDate = new Date(Date.now());
    const user = await userModel.findOne({
      isActive: true,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpiresAt: { $gt: verificationDate },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }
    user.isConfirmed = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email is confirmed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const googleLogin = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { fcmToken } = req.body;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const email = decoded.email;
    const firebaseUid = decoded.uid;
    const name = decoded.name;
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || "Na";
    const picture = decoded.picture;
    const emailVerified = decoded.email_verified;
    const googleUid = decoded.firebase?.identities?.["google.com"]?.[0];
    let user = await userModel.findOne({ email });
    if (!user || !user.isActive) {
      await userModel.findOneAndDelete({ email });
      const fcmTokens = [];
      if (fcmToken) {
        fcmTokens.push(fcmToken);
      }
      const newUser = await userModel.create({
        firstName,
        lastName,
        email,
        password: undefined,
        isConfirmed: true,
        googleId: googleUid,
        fcmToken: fcmTokens,
      });
      return createSendToken(newUser, 201, res, "Account created successfully");
    }

    if (user.googleId === null) {
      user.googleId = googleUid;
      const fcmTokens = user.fcmToken;
      if (fcmToken && !user.fcmToken.includes(fcmToken)) {
        fcmTokens.push(fcmToken);
        user.fcmToken = fcmTokens;
      }
      await user.save();
      return createSendToken(user, 200, res, "Logged in successfully");
    }

    if (user.googleId != googleUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const fcmTokens = user.fcmToken;
    if (fcmToken && !user.fcmToken.includes(fcmToken)) {
      fcmTokens.push(fcmToken);
      user.fcmToken = fcmTokens;
      await user.save();
    }
    createSendToken(user, 200, res, "Logged in successfully");
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const user = await userModel.findOne({ email, isActive: true });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Please enter a registered email" });
    }

    if (user.googleId !== null && !user.password) {
      return res.status(401).json({
        message: "Please login with google",
      });
    }

    const isPasswordValid = await user.correctPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "wrong password" });
    }
    const fcmTokens = user.fcmToken;
    if (fcmToken && !fcmTokens.includes(fcmToken)) {
      fcmTokens.push(fcmToken);
      user.fcmToken = fcmTokens;
      await user.save();
    }

    createSendToken(user, 200, res, "Logged in successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const fcmToken = req.body.fcmToken;
    if (fcmToken) {
      const fcmTokens = user.fcmToken.filter((token) => token !== fcmToken);
      user.fcmToken = fcmTokens;
      await user.save();
    }
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    user.fcmToken = [];
    user.isActive = false;
    await user.save();
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (!validateEmail(email)) {
      return res.status(422).json({
        message: "Please enter a valid email",
      });
    }

    const user = await userModel.findOne({
      email: req.body.email,
      isActive: true,
    });
    if (!user) {
      return res.status(404).json({
        message: "This email is not registerd",
      });
    }

    if (user.googleId !== null && !user.password) {
      return res.status(401).json({
        message: "Please login with google",
      });
    }

    const otp = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    const emailSent = await sendForgotPasswordEmail(otp, user.email);
    console.log("email sent", emailSent);
    if (emailSent.success) {
      return res.status(200).json({
        success: true,
        message: "forgot password email sent successfully",
        email: user.email,
      });
    }
    return res.status(500).json({
      message: emailSent.error,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyResetPasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await userModel.findOne({
      isActive: true,
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "OTP is invalid or has expired",
      });
    }
    // if token is not expired
    // Generate a short-lived token to verify identity for password reset
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_OTP_SECRET, // use a different secret if you'd like
      { expiresIn: "15m" } // token expires in 15 minutes
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken, // send to client, client sends it back during actual password reset
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    //get user based on the token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const resetToken = authHeader.split("Bearer ")[1];
    if (!resetToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = await jwt.verify(
      resetToken,
      process.env.RESET_PASSWORD_OTP_SECRET
    );
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // if token is not expired
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const isValidPassword = validatePassword(password);
    if (!isValidPassword) {
      return res.status(422).json({
        message:
          "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
      });
    }

    user.password = req.body.password;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, "Password reseted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    // get the user from the collection
    const user = await userModel.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (user.googleId !== null && !user.password) {
      return res.status(401).json({
        message: "Please login with google",
      });
    }
    // check if the password is correct

    if (
      !user ||
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res
        .status(401)
        .json({ message: "your current password is wrong" });
    }
    // if so update password
    const password = req.body.newPassword;
    const isValidPassword = validatePassword(password);
    if (!isValidPassword) {
      return res.status(422).json({
        message:
          "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
      });
    }

    user.password = password;
    await user.save();
    // log user in send jwt
    createSendToken(user, 200, res, "Password updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEmail = async (req, res) => {
  try {
    // get the user from the collection
    const user = await userModel.findById(req.user.id);

    if (user.googleId !== null && !user.password) {
      return res.status(401).json({
        message: "Please login with google",
      });
    }
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // check if the password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ message: "please enter the correct password" });
    }
    const isValidEmail = validateEmail(newEmail);
    if (!isValidEmail) {
      return res
        .status(422)
        .json({ message: "Email not valid, Write a valid email" });
    }

    const existingUser = await userModel.findOne({ email: newEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email is already registered, use another email" });
    }

    user.email = newEmail;
    user.isConfirmed = false;
    await user.save();
    try {
      const otp = user.createEmailVerificationOTP();
      await sendEmailConfirmation(otp, user.email);
      await user.save({ validateBeforeSave: false });
    } catch (err) {
      console.log(err);
    }
    // log user in send jwt
    createSendToken(
      user,
      200,
      res,
      "Email updated successfully. Please check your email to confirm your account."
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  confirmEmail,
  login,
  forgotPassword,
  verifyResetPasswordOTP,
  resetPassword,
  updatePassword,
  deleteUser,
  updateEmail,
  googleLogin,
  resendConfirmationEmail,
  logout,
};
