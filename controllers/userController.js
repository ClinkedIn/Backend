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
    let { firstName, lastName, email, password, recaptchaResponseToken } =
      req.body;
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

    //Create new User
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      isConfirmed: false,
    });

    // remove get confirm-email end point and directly send from here ✅

    try {
      await sendEmailConfirmation(newUser.id, req);
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
    const isSent = await sendEmailConfirmation(user.id, req);
    if (!isSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
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
    const { emailVerificationToken } = req.params;
    if (!emailVerificationToken) {
      return res.status(400).json({
        success: false,
        message: "Verification Token is required",
      });
    }

    const verificationDate = new Date(Date.now());
    const user = await userModel.findOne({
      isActive: true,
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
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const googleLogin = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const email = decoded.email;
    const firebaseUid = decoded.uid;
    const name = decoded.name;
    const picture = decoded.picture;
    const emailVerified = decoded.email_verified;
    const googleUid = decoded.firebase?.identities?.["google.com"]?.[0];

    let user = await userModel.findOne({ email });
    if (!user || !user.isActive) {
      await userModel.findOneAndDelete({ email });
      const newUser = await userModel.create({
        firstName: name,
        lastName: name,
        email,
        password: null,
        isEmailConfirmed: true,
        googleId: googleUid,
      });
      return createSendToken(newUser, 201, res, "Account created sucessfully");
    }

    if (user.googleId === null) {
      user.googleId = googleUid;
      await user.save();
      return createSendToken(user, 200, res);
    }

    if (user.googleId != googleUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    createSendToken(user, 200, res, "Logged in successfully");
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const user = await userModel.findOne({ email, isActive: true });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Pleas enter a registered email" });
    }

    const isPasswordValid = await user.correctPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "wrong password" });
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
    await userModel.findByIdAndUpdate(req.user.id, { isActive: false });
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
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!validateEmail(email)) {
      return res.status(422).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const user = await userModel.findOne({
      email: req.body.email,
      isActive: true,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email is not registerd",
      });
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    //get user based on the token
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      isActive: true,
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: Date.now() },
    });
    // if token is not expired
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token is invalid or has expired" });
    }
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
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    createSendToken(user, 200, res, "Password restted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyResetPasswordToken = async (req, res) => {
  try {
    //get user based on the token
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      isActive: true,
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
    const user = await userModel.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
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
      await sendEmailConfirmation(user.id);
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
  resetPassword,
  updatePassword,
  deleteUser,
  updateEmail,
  verifyResetPasswordToken,
  googleLogin,
  resendConfirmationEmail,
  logout,
};
