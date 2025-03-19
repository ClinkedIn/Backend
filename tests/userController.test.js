// userController.test.js

const userController = require("../controllers/userController.js");
const userModel = require("../models/userModel");
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
const firebaseAdmin = require("../utils/firebase");
const crypto = require("crypto");

// Create a simple mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.get = jest.fn();
  return res;
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Mocks ---
jest.mock("../models/userModel");
jest.mock("../utils/emailService");
jest.mock("../utils/validateEmailPassword");
jest.mock("../utils/verifyCaptcha");
jest.mock("./../middlewares/auth");
jest.mock("../utils/firebase");

// =======================
// Tests for registerUser
// =======================
describe("registerUser", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = {}; // no fields provided
    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "all fields are required",
    });
  });

  it("should return 400 for invalid email", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "invalid",
      password: "Password1",
      recaptchaResponseToken: "token",
    };
    validateEmail.mockReturnValue(false);
    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email not valid, Write a valid email",
    });
  });

  it("should return 400 for invalid password", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "invalid",
      recaptchaResponseToken: "token",
    };
    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(false);
    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  it("should return 400 if captcha verification fails", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password1",
      recaptchaResponseToken: "token",
    };
    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(false);
    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ msg: "reCAPTCHA verification failed. Please try again." }],
    });
  });

  it("should return 409 if user already exists", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password1",
      recaptchaResponseToken: "token",
    };
    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);
    userModel.findOne.mockResolvedValue({ _id: "existingUserId" });
    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "The User already exist use another email",
    });
  });

  it("should register new user successfully", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password1",
      recaptchaResponseToken: "token",
    };
    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);
    userModel.findOne.mockResolvedValue(null);
    const newUser = { _id: "newUserId" };
    userModel.create.mockResolvedValue(newUser);
    sendEmailConfirmation.mockResolvedValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message:
        "User registered successfully. Please check your email to confirm your account.",
      data: { accessToken: "access", refreshToken: "refresh", user: newUser },
    });
  });
});

// ==============================
// Tests for resendConfirmationEmail
// ==============================
describe("resendConfirmationEmail", () => {
  let req, res;
  beforeEach(() => {
    req = { user: {} };
    res = mockRes();
  });

  it("should return 400 if user is already confirmed", async () => {
    req.user = { id: "userId", isConfirmed: true };
    await userController.resendConfirmationEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User is already confirmed!!",
    });
  });

  it("should return 500 if email sending fails", async () => {
    req.user = { id: "userId", isConfirmed: false };
    sendEmailConfirmation.mockResolvedValue(false);
    await userController.resendConfirmationEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("should send confirmation email successfully", async () => {
    req.user = { id: "userId", isConfirmed: false };
    sendEmailConfirmation.mockResolvedValue(true);
    await userController.resendConfirmationEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message:
        "Email sent successfully.  Please check your email to confirm your account.",
    });
  });
});

// ==============================
// Tests for confirmEmail
// ==============================
describe("confirmEmail", () => {
  let req, res;
  beforeEach(() => {
    req = { params: {} };
    res = mockRes();
  });

  it("should return 400 if token is missing", async () => {
    req.params = {};
    await userController.confirmEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Verification Token is required",
    });
  });

  it("should return 400 if token is invalid or expired", async () => {
    req.params = { emailVerificationToken: "invalidToken" };
    userModel.findOne.mockResolvedValue(null);
    await userController.confirmEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it("should confirm email successfully", async () => {
    req.params = { emailVerificationToken: "validToken" };
    const user = {
      isConfirmed: false,
      emailVerificationToken: "validToken",
      emailVerificationExpiresAt: new Date(Date.now() + 10000),
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(user);
    await userController.confirmEmail(req, res);
    expect(user.isConfirmed).toBe(true);
    expect(user.emailVerificationToken).toBeNull();
    expect(user.emailVerificationExpiresAt).toBeNull();
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Email is confirmed successfully",
    });
  });
});

// ==============================
// Tests for googleLogin
// ==============================
describe("googleLogin", () => {
  let req, res;
  beforeEach(() => {
    req = { headers: {} };
    res = mockRes();
  });

  it("should return 401 if authorization header is missing", async () => {
    req.headers = {};
    await userController.googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 401 if token verification fails", async () => {
    req.headers.authorization = "Bearer invalidToken";
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error("Invalid token")),
    });
    await userController.googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should create new user if not exists", async () => {
    req.headers.authorization = "Bearer validToken";
    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    userModel.findOne.mockResolvedValue(null);
    const newUser = { _id: "newUserId" };
    userModel.create.mockResolvedValue(newUser);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.googleLogin(req, res);
    expect(userModel.create).toHaveBeenCalledWith({
      firstName: decoded.name,
      lastName: decoded.name,
      email: decoded.email,
      password: null,
      isEmailConfirmed: true,
      googleId: "googleUid",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Account created sucessfully",
      data: { accessToken: "access", refreshToken: "refresh", user: newUser },
    });
  });

  it("should update googleId if user exists with null googleId", async () => {
    req.headers.authorization = "Bearer validToken";
    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    const existingUser = {
      _id: "existingUserId",
      googleId: null,
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(existingUser);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.googleLogin(req, res);
    expect(existingUser.googleId).toBe("googleUid");
    expect(existingUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: undefined,
      data: {
        accessToken: "access",
        refreshToken: "refresh",
        user: existingUser,
      },
    });
  });

  it("should return 401 if googleId does not match", async () => {
    req.headers.authorization = "Bearer validToken";
    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["differentGoogleUid"] } },
    };
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    const existingUser = {
      _id: "existingUserId",
      googleId: "googleUid",
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(existingUser);
    await userController.googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should login successfully if googleId matches", async () => {
    req.headers.authorization = "Bearer validToken";
    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    const existingUser = {
      _id: "existingUserId",
      googleId: "googleUid",
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(existingUser);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
      data: {
        accessToken: "access",
        refreshToken: "refresh",
        user: existingUser,
      },
    });
  });
});

// ==============================
// Tests for login
// ==============================
describe("login", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
  });

  it("should return 401 if email or password not provided", async () => {
    req.body = {};
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "please provide email and password",
    });
  });

  it("should return 401 if user not found", async () => {
    req.body = { email: "john@example.com", password: "Password1" };
    userModel.findOne.mockResolvedValue(null);
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "wrong email" });
  });

  it("should return 401 if password is incorrect", async () => {
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(false),
    };
    req.body = { email: "john@example.com", password: "Password1" };
    userModel.findOne.mockResolvedValue(user);
    await userController.login(req, res);
    expect(user.correctPassword).toHaveBeenCalledWith("Password1", "hashed");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "wrong password" });
  });

  it("should login successfully", async () => {
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
    };
    req.body = { email: "john@example.com", password: "Password1" };
    userModel.findOne.mockResolvedValue(user);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.login(req, res);
    expect(user.correctPassword).toHaveBeenCalledWith("Password1", "hashed");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
      data: { accessToken: "access", refreshToken: "refresh", user },
    });
  });
});

// ==============================
// Tests for deleteUser
// ==============================
describe("deleteUser", () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: "userId" } };
    res = mockRes();
  });

  it("should delete user successfully", async () => {
    userModel.findByIdAndDelete.mockResolvedValue(true);
    await userController.deleteUser(req, res);
    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: null,
    });
  });
});

// ==============================
// Tests for forgotPassword
// ==============================
describe("forgotPassword", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
  });

  it("should throw error if user not found", async () => {
    req.body = { email: "john55@example.com" };
    userModel.findOne.mockResolvedValue(null);
    await expect(userController.forgotPassword(req, res)).rejects.toThrow(
      "There is no such email address"
    );
  });

  it("should send forgot password email successfully", async () => {
    const user = {
      email: "john@example.com",
      createPasswordResetToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn().mockResolvedValue(true),
    };
    req.body = { email: "john@example.com" };
    userModel.findOne.mockResolvedValue(user);
    sendForgotPasswordEmail.mockResolvedValue({ success: true });
    req.protocol = "http";
    req.get = jest.fn().mockReturnValue("localhost");

    await userController.forgotPassword(req, res);
    expect(user.createPasswordResetToken).toHaveBeenCalled();
    expect(user.save).toHaveBeenCalled();
    expect(sendForgotPasswordEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "forgot password email sent successfully",
      email: user.email,
    });
  });

  it("should return 500 if forgot password email fails", async () => {
    const user = {
      email: "john@example.com",
      createPasswordResetToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn().mockResolvedValue(true),
    };
    req.body = { email: "john@example.com" };
    userModel.findOne.mockResolvedValue(user);
    sendForgotPasswordEmail.mockResolvedValue({
      success: false,
      error: "Email error",
    });
    req.protocol = "http";
    req.get = jest.fn().mockReturnValue("localhost");

    await userController.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email error",
    });
  });
});

// ==============================
// Tests for resetPassword
// ==============================
describe("resetPassword", () => {
  let req, res;
  beforeEach(() => {
    req = { params: { token: "plainToken" }, body: {} };
    res = mockRes();
  });

  it("should return 400 if token is invalid or expired", async () => {
    userModel.findOne.mockResolvedValue(null);
    await userController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token is invalid or has expired",
    });
  });

  it("should return 400 if new password is invalid", async () => {
    const user = {
      passwordResetToken: "hashedToken",
      passwordResetExpiresAt: Date.now() + 10000,
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(user);
    req.body = { password: "invalid" };
    validatePassword.mockReturnValue(false);
    await userController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  it("should reset password successfully", async () => {
    const user = {
      passwordResetToken: "hashedToken",
      passwordResetExpiresAt: Date.now() + 10000,
      save: jest.fn().mockResolvedValue(true),
    };
    // Create hashed token to simulate matching
    const hashedToken = crypto
      .createHash("sha256")
      .update("plainToken")
      .digest("hex");
    userModel.findOne.mockResolvedValue(user);
    req.body = { password: "Password1" };
    validatePassword.mockReturnValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.resetPassword(req, res);
    expect(user.password).toBe("Password1");
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.passwordResetExpiresAt).toBeUndefined();
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Password restted successfully",
      data: { accessToken: "access", refreshToken: "refresh", user },
    });
  });
});

// ==============================
// Tests for verifyResetPasswordToken
// ==============================
describe("verifyResetPasswordToken", () => {
  let req, res;
  beforeEach(() => {
    req = { params: { token: "plainToken" } };
    res = mockRes();
  });

  it("should return 400 if token is invalid or expired", async () => {
    userModel.findOne.mockResolvedValue(null);
    await userController.verifyResetPasswordToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token is invalid or has expired",
    });
  });

  it("should verify token successfully", async () => {
    const user = { email: "john@example.com" };
    userModel.findOne.mockResolvedValue(user);
    await userController.verifyResetPasswordToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: { email: user.email },
    });
  });
});

// ==============================
// Tests for updatePassword
// ==============================
describe("updatePassword", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: {} };
    res = mockRes();
  });

  it("should return 401 if current password is wrong", async () => {
    req.body = { passwordCurrent: "wrong", password: "NewPassword1" };
    req.user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(false),
    };
    await userController.updatePassword(req, res);
    expect(req.user.correctPassword).toHaveBeenCalledWith("wrong", "hashed");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "your current password is wrong",
    });
  });

  it("should return 400 if new password is invalid", async () => {
    req.body = { passwordCurrent: "current", password: "invalid" };
    req.user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
    };
    validatePassword.mockReturnValue(false);
    await userController.updatePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  it("should update password successfully", async () => {
    req.body = { passwordCurrent: "current", password: "NewPassword1" };
    req.user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    validatePassword.mockReturnValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.updatePassword(req, res);
    expect(req.user.correctPassword).toHaveBeenCalledWith("current", "hashed");
    expect(req.user.password).toBe("NewPassword1");
    expect(req.user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Password updated successfully",
      data: { accessToken: "access", refreshToken: "refresh", user: req.user },
    });
  });
});

// ==============================
// Tests for updateEmail
// ==============================
describe("updateEmail", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: "userId" } };
    res = mockRes();
  });

  it("should return 401 if current password is wrong", async () => {
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(false),
    };
    userModel.findById.mockResolvedValue(user);
    req.body = { newEmail: "new@example.com", password: "wrong" };
    await userController.updateEmail(req, res);
    expect(user.correctPassword).toHaveBeenCalledWith("wrong", "hashed");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "please enter the correct password",
    });
  });

  it("should return 400 if new email is invalid", async () => {
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findById.mockResolvedValue(user);
    req.body = { newEmail: "invalid", password: "correct" };
    validateEmail.mockReturnValue(false);
    await userController.updateEmail(req, res);
    expect(validateEmail).toHaveBeenCalledWith("invalid");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email not valid, Write a valid email",
    });
  });

  it("should update email successfully", async () => {
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findById.mockResolvedValue(user);
    req.body = { newEmail: "new@example.com", password: "correct" };
    validateEmail.mockReturnValue(true);
    sendEmailConfirmation.mockResolvedValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.updateEmail(req, res);
    expect(user.email).toBe("new@example.com");
    expect(user.isConfirmed).toBe(false);
    expect(user.save).toHaveBeenCalled();
    expect(sendEmailConfirmation).toHaveBeenCalledWith(user.id || user._id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message:
        "Email updated successfully. Please check your email to confirm your account.",
      data: { accessToken: "access", refreshToken: "refresh", user },
    });
  });
});

// ==============================
// Tests for updateName
// ==============================
describe("updateName", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: { firstName: "Jane", lastName: "Doe" },
      user: { id: "userId" },
    };
    res = mockRes();
  });

  it("should update name successfully", async () => {
    const updatedUser = { _id: "userId", firstName: "Jane", lastName: "Doe" };
    userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.updateName(req, res);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "userId",
      { firstName: "Jane", lastName: "Doe" },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Name updated sucessfully",
      data: {
        accessToken: "access",
        refreshToken: "refresh",
        user: updatedUser,
      },
    });
  });
});
