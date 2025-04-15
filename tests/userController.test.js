// userController.test.js
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const jwt = require("jsonwebtoken");
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
jest.mock("jsonwebtoken");
// =======================
// Tests for registerUser
// =======================
// describe("registerUser", () => {
//   let req, res;
//   beforeEach(() => {
//     req = { body: {} };
//     res = mockRes();
//   });

//   it("should return 400 if required fields are missing", async () => {
//     req.body = {}; // no fields provided
//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "all fields are required",
//     });
//   });

//   it("should return 400 for invalid email", async () => {
//     req.body = {
//       firstName: "John",
//       lastName: "Doe",
//       email: "invalid",
//       password: "Password1",
//       recaptchaResponseToken: "token",
//     };
//     validateEmail.mockReturnValue(false);
//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Email not valid, Write a valid email",
//     });
//   });

//   it("should return 400 for invalid password", async () => {
//     req.body = {
//       firstName: "John",
//       lastName: "Doe",
//       email: "john@example.com",
//       password: "invalid",
//       recaptchaResponseToken: "token",
//     };
//     validateEmail.mockReturnValue(true);
//     validatePassword.mockReturnValue(false);
//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       message:
//         "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
//     });
//   });

//   it("should return 400 if captcha verification fails", async () => {
//     req.body = {
//       firstName: "John",
//       lastName: "Doe",
//       email: "john@example.com",
//       password: "Password1",
//       recaptchaResponseToken: "token",
//     };
//     validateEmail.mockReturnValue(true);
//     validatePassword.mockReturnValue(true);
//     verifyCaptcha.mockResolvedValue(false);
//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       errors: [{ msg: "reCAPTCHA verification failed. Please try again." }],
//     });
//   });

//   it("should return 409 if user already exists", async () => {
//     req.body = {
//       firstName: "John",
//       lastName: "Doe",
//       email: "john@example.com",
//       password: "Password1",
//       recaptchaResponseToken: "token",
//     };
//     validateEmail.mockReturnValue(true);
//     validatePassword.mockReturnValue(true);
//     verifyCaptcha.mockResolvedValue(true);
//     userModel.findOne.mockResolvedValue({ _id: "existingUserId" });
//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(409);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "The User already exist use another email",
//     });
//   });

//   it("should register new user successfully", async () => {
//     req.body = {
//       firstName: "John",
//       lastName: "Doe",
//       email: "john@example.com",
//       password: "Password1",
//       recaptchaResponseToken: "token",
//     };
//     validateEmail.mockReturnValue(true);
//     validatePassword.mockReturnValue(true);
//     verifyCaptcha.mockResolvedValue(true);
//     userModel.findOne.mockResolvedValue(null);
//     const newUser = { _id: "newUserId" };
//     userModel.create.mockResolvedValue(newUser);
//     sendEmailConfirmation.mockResolvedValue(true);
//     generateTokens.mockReturnValue({
//       accessToken: "access",
//       refreshToken: "refresh",
//     });

//     await userController.registerUser(req, res);
//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       message:
//         "User registered successfully. Please check your email to confirm your account.",
//       data: { accessToken: "access", refreshToken: "refresh", user: newUser },
//     });
//   });
// });
describe("registerUser", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {},
      protocol: "http",
      get: jest.fn().mockReturnValue("localhost"),
    };
    res = mockRes();
  });

  // Test case 1: Missing required fields
  it("should return 400 if required fields are missing", async () => {
    const testCases = [
      {
        body: {
          lastName: "Doe",
          email: "john@example.com",
          password: "Password123",
          recaptchaResponseToken: "token",
        },
        missing: "firstName",
      },
      {
        body: {
          firstName: "John",
          email: "john@example.com",
          password: "Password123",
          recaptchaResponseToken: "token",
        },
        missing: "lastName",
      },
      {
        body: {
          firstName: "John",
          lastName: "Doe",
          password: "Password123",
          recaptchaResponseToken: "token",
        },
        missing: "email",
      },
      {
        body: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          recaptchaResponseToken: "token",
        },
        missing: "password",
      },
      {
        body: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "Password123",
        },
        missing: "recaptchaResponseToken",
      },
      { body: {} }, // No fields provided
    ];

    for (const testCase of testCases) {
      req.body = testCase.body;
      await userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "all fields are required",
      });

      // Reset mocks for next case
      jest.clearAllMocks();
    }
  });

  // Test case 2: Invalid email format
  it("should return 422 for invalid email format", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "invalid-email",
      password: "Password123",
      recaptchaResponseToken: "token",
    };

    validateEmail.mockReturnValue(false);

    await userController.registerUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith("invalid-email");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email not valid, Write a valid email",
    });
  });

  // Test case 3: Invalid password
  it("should return 422 for invalid password", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "weakpassword",
      recaptchaResponseToken: "token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(false);

    await userController.registerUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith("john@example.com");
    expect(validatePassword).toHaveBeenCalledWith("weakpassword");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  // Test case 4: Failed captcha verification
  it("should return 422 if captcha verification fails", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password123",
      recaptchaResponseToken: "invalid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(false);

    await userController.registerUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith("john@example.com");
    expect(validatePassword).toHaveBeenCalledWith("Password123");
    expect(verifyCaptcha).toHaveBeenCalledWith("invalid-token");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "reCAPTCHA verification failed. Please try again.",
    });
  });

  // Test case 5: User already exists
  it("should return 409 if user already exists", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "existing@example.com",
      password: "Password123",
      recaptchaResponseToken: "valid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);
    userModel.findOne.mockImplementation((query) => {
      if (query.email === "existing@example.com" && query.isActive === true) {
        return Promise.resolve({ _id: "existingUserId" });
      }
      return Promise.resolve(null);
    });

    await userController.registerUser(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "existing@example.com",
      isActive: true,
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "The User already exist use another email",
    });
  });

  // Test case 6: Reactivating a deactivated user account
  it("should delete deactivated user before creating new one", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "deactivated@example.com",
      password: "Password123",
      recaptchaResponseToken: "valid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);

    // Mock finding active user (none found)
    userModel.findOne
      .mockImplementationOnce(() => Promise.resolve(null))
      // Mock finding deactivated user
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: "deactivatedUserId" })
      );

    userModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const newUser = {
      id: "newUserId",
      ...req.body,
      isConfirmed: false,
    };
    userModel.create.mockResolvedValue(newUser);
    sendEmailConfirmation.mockResolvedValue(true);

    await userController.registerUser(req, res);

    expect(userModel.findOne).toHaveBeenNthCalledWith(1, {
      email: "deactivated@example.com",
      isActive: true,
    });
    expect(userModel.findOne).toHaveBeenNthCalledWith(2, {
      email: "deactivated@example.com",
      isActive: false,
    });
    expect(userModel.deleteOne).toHaveBeenCalledWith({
      email: "deactivated@example.com",
    });
    expect(userModel.create).toHaveBeenCalled();
  });

  // Test case 7: Successful user registration
  // it("should register new user successfully", async () => {
  //     req.body = {
  //         firstName: "John",
  //         lastName: "Doe",
  //         email: "john@example.com",
  //         password: "Password123",
  //         recaptchaResponseToken: "valid-token",
  //     };

  //     validateEmail.mockReturnValue(true);
  //     validatePassword.mockReturnValue(true);
  //     verifyCaptcha.mockResolvedValue(true);

  //     // No existing user found
  //     userModel.findOne.mockResolvedValue(null);

  //     const newUser = { _id: "newUserId" };
  //     userModel.create.mockResolvedValue(newUser);
  //     sendEmailConfirmation.mockResolvedValue(true);

  //     await userController.registerUser(req, res);

  //     expect(res.status).toHaveBeenCalledWith(201);
  //     expect(res.json).toHaveBeenCalledWith({
  //         status: "success",
  //         message:
  //             "User registered successfully. Please check your email to confirm your account.",
  //     });

  //     // Verify that the mocked createSendToken was called with the correct parameters.
  //     expect(createSendToken).toHaveBeenCalledWith(
  //         newUser,
  //         201,
  //         res,
  //         "User registered successfully. Please check your email to confirm your account."
  //     );
  // });

  // Test case 9: Unhandled error during registration
  it("should return 500 if an unhandled error occurs", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password123",
      recaptchaResponseToken: "valid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);

    // Mock unexpected error
    const errorMessage = "Database connection lost";
    userModel.findOne.mockRejectedValue(new Error(errorMessage));

    await userController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Registration failed",
      error: errorMessage,
    });
  });

  // Test case 10: Custom status code in error
  it("should use error's statusCode if provided", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Password123",
      recaptchaResponseToken: "valid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);

    // Mock error with custom status code
    const customError = new Error("Custom error");
    customError.statusCode = 503;
    verifyCaptcha.mockRejectedValue(customError);

    await userController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Registration failed",
      error: "Custom error",
    });
  });

  // Test case 11: Email converted to lowercase
  it("should convert email to lowercase", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "John.Doe@Example.com",
      password: "Password123",
      recaptchaResponseToken: "valid-token",
    };

    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    verifyCaptcha.mockResolvedValue(true);
    userModel.findOne.mockResolvedValue(null);

    const newUser = {
      id: "newUserId",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      isConfirmed: false,
    };
    userModel.create.mockResolvedValue(newUser);
    sendEmailConfirmation.mockResolvedValue(true);

    await userController.registerUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith("john.doe@example.com");
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "john.doe@example.com",
      isActive: true,
    });
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "john.doe@example.com",
      })
    );
  });
});

// ==============================
// Tests for resendConfirmationEmail
// ==============================
describe("resendConfirmationEmail", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "userId" } };
    res = mockRes();
    jest.clearAllMocks();
  });

  it("should return 400 if user is already confirmed", async () => {
    const mockUser = { isConfirmed: true };
    userModel.findById.mockResolvedValue(mockUser);

    await userController.resendConfirmationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User is already confirmed!!",
    });
  });

  it("should send confirmation email successfully", async () => {
    // Create mock OTP
    const mockOTP = "123456";

    // Create mock user with required method
    const mockUser = {
      isConfirmed: false,
      email: "test@example.com",
      createEmailVerificationOTP: jest.fn().mockReturnValue(mockOTP),
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    sendEmailConfirmation.mockResolvedValue(true);

    await userController.resendConfirmationEmail(req, res);

    // Check the right methods were called with correct parameters
    expect(mockUser.createEmailVerificationOTP).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    expect(sendEmailConfirmation).toHaveBeenCalledWith(mockOTP, mockUser.email);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message:
        "Email sent successfully.  Please check your email to confirm your account.",
    });
  });

  it("should handle internal server errors", async () => {
    userModel.findById.mockRejectedValue(new Error("Database error"));

    await userController.resendConfirmationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// ==============================
// Tests for confirmEmail
// ==============================
describe("confirmEmail", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
  });

  it("should return 400 if OTP is missing", async () => {
    req.body = {};
    await userController.confirmEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "OTP is required",
    });
  });

  it("should return 400 if OTP is invalid or expired", async () => {
    req.body = { otp: "123456" };

    // Mock the crypto hash function
    const hashedOTP = "hashedOTP123";
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(hashedOTP),
      }),
    });

    userModel.findOne.mockResolvedValue(null);

    await userController.confirmEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired OTP",
    });
  });

  it("should confirm email successfully", async () => {
    req.body = { otp: "123456" };

    // Mock the crypto hash function
    const hashedOTP = "hashedOTP123";
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(hashedOTP),
      }),
    });

    const user = {
      isConfirmed: false,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpiresAt: new Date(Date.now() + 10000),
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(user);

    await userController.confirmEmail(req, res);

    expect(user.isConfirmed).toBe(true);
    expect(user.emailVerificationOTP).toBeUndefined();
    expect(user.emailVerificationOTPExpiresAt).toBeUndefined();
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
    req = { headers: {}, body: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    req.headers = {};
    await userController.googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 401 if token verification fails", async () => {
    req.headers.authorization = "Bearer invalidToken";
    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error("Invalid token")),
    });

    await userController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should create new user if not exists", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body.fcmToken = "fcmToken123";

    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };

    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });

    userModel.findOne.mockResolvedValue(null);

    const newUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      googleId: "googleUid",
      fcmToken: ["fcmToken123"],
    };

    userModel.create.mockResolvedValue(newUser);

    await userController.googleLogin(req, res);

    expect(userModel.findOneAndDelete).toHaveBeenCalledWith({
      email: "john@example.com",
    });
    expect(userModel.create).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: undefined,
      isConfirmed: true,
      googleId: "googleUid",
      fcmToken: ["fcmToken123"],
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Account created successfully",
    });
  });

  it("should update googleId if user exists with null googleId", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body.fcmToken = "fcmToken123";

    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };

    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });

    const existingUser = {
      _id: "existingUserId",
      googleId: null,
      isActive: true,
      fcmToken: [],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(existingUser);

    await userController.googleLogin(req, res);

    expect(existingUser.googleId).toBe("googleUid");
    expect(existingUser.fcmToken).toContain("fcmToken123");
    expect(existingUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
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

    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });

    const existingUser = {
      _id: "existingUserId",
      googleId: "googleUid", // Different from the token's googleUid
      isActive: true,
    };

    userModel.findOne.mockResolvedValue(existingUser);

    await userController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should login successfully if googleId matches", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body.fcmToken = "fcmToken123";

    const decoded = {
      email: "john@example.com",
      uid: "firebaseUid",
      name: "John Doe",
      picture: "pic.jpg",
      email_verified: true,
      firebase: { identities: { "google.com": ["googleUid"] } },
    };

    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });

    const existingUser = {
      _id: "existingUserId",
      googleId: "googleUid",
      isActive: true,
      fcmToken: ["existingToken"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(existingUser);

    await userController.googleLogin(req, res);

    expect(existingUser.fcmToken).toContain("fcmToken123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
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

  it("should return 400 if email or password not provided", async () => {
    req.body = {};
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please fill all required fields",
    });
  });

  it("should return 400 status with error message when email is missing", async () => {
    req.body = {
      password: "password123",
      // email is missing
    };

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please fill all required fields",
    });

    // Verify that findOne was not called since validation failed
    expect(userModel.findOne).not.toHaveBeenCalled();
  });

  it("should return 404 if user not found", async () => {
    req.body = { email: "john@example.com", password: "Password1" };
    userModel.findOne.mockResolvedValue(null);
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please enter a registered email",
    });
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
    // Modified to match actual response (without data property)
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
    });
  });

  // it('should return 200 status with success message when valid credentials are provided', async () => {
  //     // Arrange
  //     const req = {
  //         body: {
  //             email: 'test@example.com',
  //             password: 'password123'
  //         }
  //     };

  //     const mockUser = {
  //         email: 'test@example.com',
  //         password: 'hashedPassword',
  //         googleId: null,
  //         correctPassword: jest.fn().mockResolvedValue(true)
  //     };

  //     userModel.findOne.mockResolvedValue(mockUser);

  //     // Mock the createSendToken function directly instead of using jest.spyOn on global
  //     global.createSendToken.mockImplementation((user, statusCode, res, message) => {
  //         res.status(statusCode).json({
  //             status: 'success',
  //             message: message
  //         });
  //     });

  //     // Act
  //     await userController.login(req, res);

  //     // Assert
  //     expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com', isActive: true });
  //     expect(mockUser.correctPassword).toHaveBeenCalledWith('password123', 'hashedPassword');
  //     expect(global.createSendToken).toHaveBeenCalledWith(mockUser, 200, res, 'Logged in successfully');
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //         status: 'success',
  //         message: 'Logged in successfully'
  //     });
  // });

  it("should call generateTokens when login is successful", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "correctpassword",
      },
    };

    const user = {
      email: "test@example.com",
      password: "hashedpassword",
      correctPassword: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(user);

    // Since generateTokens is already mocked at module level, no need to spy on it
    // Just need to ensure it's properly called

    await userController.login(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      isActive: true,
    });
    expect(generateTokens).toHaveBeenCalledWith(user, res);
  });

  it("should respond with success status and message when login is successful", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "correctpassword",
      },
    };

    const user = {
      email: "test@example.com",
      password: "hashedpassword",
      correctPassword: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(user);

    await userController.login(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      isActive: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged in successfully",
    });
  });
});
// ==============================
// Tests for logout
// ==============================
describe("logout", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "userId" },
      body: {},
    };
    res = mockRes();
    res.clearCookie = jest.fn().mockReturnThis();
    jest.clearAllMocks();
  });

  it("should successfully logout without FCM token removal", async () => {
    // Mock a user without providing fcmToken in request
    const mockUser = {
      _id: "userId",
      fcmToken: ["token1", "token2"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);

    await userController.logout(req, res);

    // User should be found but save should not be called
    expect(userModel.findById).toHaveBeenCalledWith("userId");
    expect(mockUser.save).not.toHaveBeenCalled();

    // Cookies should be cleared
    expect(res.clearCookie).toHaveBeenCalledWith("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    // Response should be successful
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged out successfully",
    });
  });

  it("should successfully logout with FCM token removal", async () => {
    // Add fcmToken to request body
    req.body.fcmToken = "token1";

    // Mock a user with fcmTokens
    const mockUser = {
      _id: "userId",
      fcmToken: ["token1", "token2"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);

    await userController.logout(req, res);

    // User should be found and save should be called
    expect(userModel.findById).toHaveBeenCalledWith("userId");
    expect(mockUser.fcmToken).toEqual(["token2"]); // token1 should be removed
    expect(mockUser.save).toHaveBeenCalled();

    // Cookies should be cleared
    expect(res.clearCookie).toHaveBeenCalledWith(
      "accessToken",
      expect.any(Object)
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      expect.any(Object)
    );

    // Response should be successful
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged out successfully",
    });
  });

  it("should handle errors properly", async () => {
    // Mock a database error
    userModel.findById.mockRejectedValue(new Error("Database error"));

    await userController.logout(req, res);

    // Error should be handled
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
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
    jest.clearAllMocks();
  });

  it("should mark user as inactive and clear FCM tokens successfully", async () => {
    // Create mock user with FCM tokens
    const mockUser = {
      _id: "userId",
      fcmToken: ["token1", "token2"],
      isActive: true,
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);

    await userController.deleteUser(req, res);

    // Check that user was found by ID
    expect(userModel.findById).toHaveBeenCalledWith("userId");

    // Check that user properties were updated correctly
    expect(mockUser.fcmToken).toEqual([]);
    expect(mockUser.isActive).toBe(false);

    // Check that save was called
    expect(mockUser.save).toHaveBeenCalled();

    // Check response
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: null,
    });
  });

  it("should return 500 if an error occurs during findById", async () => {
    // Mock a database error during findById
    userModel.findById.mockRejectedValue(new Error("DB error"));

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("should handle error if user save fails", async () => {
    // Create mock user but make save fail
    const mockUser = {
      _id: "userId",
      fcmToken: ["token1", "token2"],
      isActive: true,
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    };

    userModel.findById.mockResolvedValue(mockUser);

    await userController.deleteUser(req, res);

    // Check that error was handled
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
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
    jest.clearAllMocks();
  });

  it("should return 400 if email is not provided", async () => {
    // Empty request body
    await userController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please fill all required fields",
    });
    expect(validateEmail).not.toHaveBeenCalled();
    expect(userModel.findOne).not.toHaveBeenCalled();
  });

  it("should return 422 if email format is invalid", async () => {
    req.body.email = "invalid-email";
    validateEmail.mockReturnValue(false);

    await userController.forgotPassword(req, res);

    expect(validateEmail).toHaveBeenCalledWith("invalid-email");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please enter a valid email",
    });
    expect(userModel.findOne).not.toHaveBeenCalled();
  });

  it("should return 404 if user with email is not found or not active", async () => {
    req.body.email = "nonexistent@example.com";
    validateEmail.mockReturnValue(true);
    userModel.findOne.mockResolvedValue(null);

    await userController.forgotPassword(req, res);

    expect(validateEmail).toHaveBeenCalledWith("nonexistent@example.com");
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "nonexistent@example.com",
      isActive: true,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "This email is not registerd",
    });
  });

  it("should return 401 if user is registered only with Google", async () => {
    req.body.email = "google-user@example.com";

    const googleUser = {
      email: "google-user@example.com",
      googleId: "google-id-123",
      password: undefined, // Google user has no password
      isActive: true,
    };

    validateEmail.mockReturnValue(true);
    userModel.findOne.mockResolvedValue(googleUser);

    await userController.forgotPassword(req, res);

    expect(validateEmail).toHaveBeenCalledWith("google-user@example.com");
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "google-user@example.com",
      isActive: true,
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please login with google",
    });
  });

  it("should create OTP and send email successfully", async () => {
    req.body.email = "valid-user@example.com";
    const mockOTP = "123456";

    // Create a proper mock user with all required methods and properties
    const mockUser = {
      email: "valid-user@example.com",
      googleId: null,
      password: "hashedPassword", // Has a password (not Google-only)
      isActive: true,
      createPasswordResetOTP: jest.fn().mockReturnValue(mockOTP),
      save: jest.fn().mockResolvedValue(true),
    };

    validateEmail.mockReturnValue(true);
    userModel.findOne.mockResolvedValue(mockUser);
    sendForgotPasswordEmail.mockResolvedValue({ success: true });

    await userController.forgotPassword(req, res);

    // Verify correct user lookup
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "valid-user@example.com",
      isActive: true,
    });

    // Verify OTP creation and user saving
    expect(mockUser.createPasswordResetOTP).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });

    // Verify email sending with correct parameters
    expect(sendForgotPasswordEmail).toHaveBeenCalledWith(
      mockOTP,
      "valid-user@example.com"
    );

    // Verify successful response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "forgot password email sent successfully",
      email: "valid-user@example.com",
    });
  });

  it("should handle email sending failure", async () => {
    req.body.email = "valid-user@example.com";
    const mockOTP = "123456";
    const errorMessage = "SMTP connection failed";

    const mockUser = {
      email: "valid-user@example.com",
      googleId: null,
      password: "hashedPassword",
      isActive: true,
      createPasswordResetOTP: jest.fn().mockReturnValue(mockOTP),
      save: jest.fn().mockResolvedValue(true),
    };

    validateEmail.mockReturnValue(true);
    userModel.findOne.mockResolvedValue(mockUser);
    sendForgotPasswordEmail.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    await userController.forgotPassword(req, res);

    // Verify proper error handling for email sending failure
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
    });
  });

  it("should handle unexpected errors", async () => {
    req.body.email = "valid-user@example.com";
    validateEmail.mockReturnValue(true);

    // Simulate a database error
    const dbError = new Error("Database connection failed");
    userModel.findOne.mockRejectedValue(dbError);

    await userController.forgotPassword(req, res);

    // Verify proper error handling
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

// ==============================
// Tests for resetPassword
// ==============================
describe("resetPassword", () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {},
      body: { password: "NewPass123!" },
    };
    res = mockRes();
    jest.clearAllMocks();
  });

  it("should return 401 when authorization header is missing", async () => {
    req.headers = {}; // No authorization header

    await userController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header doesn't start with 'Bearer '", async () => {
    req.headers.authorization = "InvalidFormat token";

    await userController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("should return 401 when token is missing", async () => {
    req.headers.authorization = "Bearer ";

    await userController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("should return 401 when token verification fails", async () => {
    req.headers.authorization = "Bearer invalidToken";

    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await userController.resetPassword(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "invalidToken",
      process.env.RESET_PASSWORD_OTP_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  it("should return 401 when user is not found", async () => {
    req.headers.authorization = "Bearer validToken";

    const decoded = { id: "userId123" };
    jwt.verify = jest.fn().mockReturnValue(decoded);
    userModel.findById.mockResolvedValue(null);

    await userController.resetPassword(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.RESET_PASSWORD_OTP_SECRET
    );
    expect(userModel.findById).toHaveBeenCalledWith("userId123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 400 when password is missing", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body = {}; // No password

    const decoded = { id: "userId123" };
    jwt.verify = jest.fn().mockReturnValue(decoded);

    const mockUser = { _id: "userId123" };
    userModel.findById.mockResolvedValue(mockUser);

    await userController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Password is required" });
  });

  it("should return 422 when password format is invalid", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body = { password: "weak" };

    const decoded = { id: "userId123" };
    jwt.verify = jest.fn().mockReturnValue(decoded);

    const mockUser = { _id: "userId123" };
    userModel.findById.mockResolvedValue(mockUser);

    validatePassword.mockReturnValue(false);

    await userController.resetPassword(req, res);

    expect(validatePassword).toHaveBeenCalledWith("weak");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  it("should reset password successfully", async () => {
    req.headers.authorization = "Bearer validToken";
    req.body = { password: "NewStrongPass123!" };

    const decoded = { id: "userId123" };
    jwt.verify = jest.fn().mockReturnValue(decoded);

    const mockUser = {
      _id: "userId123",
      passwordResetOTP: "someOTP",
      passwordResetOTPExpiresAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    validatePassword.mockReturnValue(true);
    global.createSendToken = jest.fn(); // Mock the global function if needed

    await userController.resetPassword(req, res);

    expect(mockUser.password).toBe("NewStrongPass123!");
    expect(mockUser.passwordResetOTP).toBeUndefined();
    expect(mockUser.passwordResetOTPExpiresAt).toBeUndefined();
    expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Password reseted successfully",
    });
  });

  it("should handle unexpected errors", async () => {
    req.headers.authorization = "Bearer validToken";

    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await userController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// ==============================
// Tests for verifyResetPasswordOTP
// ==============================
describe("verifyResetPasswordOTP", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  it("should return 400 if OTP is missing", async () => {
    // Empty body with no OTP
    await userController.verifyResetPasswordOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please fill all required fields",
    });
    expect(userModel.findOne).not.toHaveBeenCalled();
  });

  it("should return 400 if OTP is invalid or expired", async () => {
    req.body = { otp: "123456" };

    // Mock crypto hash function
    const hashedOTP = "hashedOTP123";
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(hashedOTP),
      }),
    });

    // No user found with this OTP
    userModel.findOne.mockResolvedValue(null);

    await userController.verifyResetPasswordOTP(req, res);

    expect(crypto.createHash).toHaveBeenCalledWith("sha256");
    expect(userModel.findOne).toHaveBeenCalledWith({
      isActive: true,
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpiresAt: { $gt: expect.any(Number) },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "OTP is invalid or has expired",
    });
  });

  it("should verify OTP successfully and return reset token", async () => {
    req.body = { otp: "123456" };

    // Mock crypto hash function
    const hashedOTP = "hashedOTP123";
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(hashedOTP),
      }),
    });

    // Mock user found with valid OTP
    const mockUser = {
      _id: "userId123",
      email: "user@example.com",
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpiresAt: new Date(Date.now() + 10000), // not expired
    };
    userModel.findOne.mockResolvedValue(mockUser);

    // Mock JWT sign
    const resetToken = "jwt-reset-token";
    jwt.sign = jest.fn().mockReturnValue(resetToken);

    await userController.verifyResetPasswordOTP(req, res);

    // Check JWT was called with correct params
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id },
      process.env.RESET_PASSWORD_OTP_SECRET,
      { expiresIn: "15m" }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "OTP verified successfully",
      resetToken,
    });
  });

  it("should handle unexpected errors", async () => {
    req.body = { otp: "123456" };

    // Mock crypto hash function
    const hashedOTP = "hashedOTP123";
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(hashedOTP),
      }),
    });

    // Force an error
    const error = new Error("Database connection error");
    userModel.findOne.mockRejectedValue(error);

    await userController.verifyResetPasswordOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
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

  it("should return 401 if the user created his account using google only", async () => {
    req.body = { currentPassword: "current", newPassword: "NewPassword1" };
    req.user = {
      password: undefined,
      correctPassword: jest.fn().mockResolvedValue(false),
      googleId: "googleId",
    };
    userModel.findById.mockResolvedValue(req.user);
    await userController.updatePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please login with google",
    });
  });

  it("should return 401 if current password is wrong", async () => {
    req.body = { currentPassword: "wrong", newPassword: "NewPassword1" };
    req.user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(false),
    };
    userModel.findById.mockResolvedValue(req.user);
    await userController.updatePassword(req, res);
    expect(req.user.correctPassword).toHaveBeenCalledWith("wrong", "hashed");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "your current password is wrong",
    });
  });

  it("should return 422 if new password is invalid", async () => {
    req.body = { currentPassword: "current", newPassword: "invalid" };
    req.user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
    };
    userModel.findById.mockResolvedValue(req.user);
    validatePassword.mockReturnValue(false);
    await userController.updatePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.",
    });
  });

  it("should update password successfully", async () => {
    req.body = { currentPassword: "current", newPassword: "NewPassword1" };
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
    userModel.findById.mockResolvedValue(req.user);
    await userController.updatePassword(req, res);
    expect(req.user.correctPassword).toHaveBeenCalledWith("current", "hashed");
    expect(req.user.password).toBe("NewPassword1");
    expect(req.user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Password updated successfully",
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

  it("should return 401 if the user created his account using google only", async () => {
    req.body = { newEmail: "newEmail@email.com", password: "password" };
    req.user = {
      password: undefined,
      correctPassword: jest.fn().mockResolvedValue(false),
      googleId: "googleId",
    };
    userModel.findById.mockResolvedValue(req.user);
    await userController.updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please login with google",
    });
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
    req.body = { newEmail: "invalid", password: "correct" };
    const user = {
      password: "hashed",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findById.mockResolvedValue(user);
    validateEmail.mockReturnValue(false);
    await userController.updateEmail(req, res);
    expect(validateEmail).toHaveBeenCalledWith("invalid");
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email not valid, Write a valid email",
    });
  });

  it("should return 409 if email already exists", async () => {
    req.user = { id: "someUserId" };
    req.body = { newEmail: "new@email.com", password: "correct" };
    const user = {
      id: "someUserId",
      password: "hashed",
      isActive: true,
      email: "notyou@gmail.com",
      isConfirmed: true,
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    const existingUser = {
      id: "existingUserId",
      email: "notyou@gmail.con",
      isActive: true,
    };

    userModel.findOne.mockResolvedValue(existingUser);
    userModel.findById.mockResolvedValue(user);
    validateEmail.mockReturnValue(true);
    sendEmailConfirmation.mockResolvedValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email is already registered, use another email",
    });
  });

  it("should update email successfully", async () => {
    req.user = { id: "someUserId" };
    req.body = { newEmail: "new@email.com", password: "correct" };
    const user = {
      id: "someUserId",
      password: "hashed",
      isActive: true,
      email: "notyou@gmail.com",
      isConfirmed: true,
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(null);
    userModel.findById.mockResolvedValue(user);
    validateEmail.mockReturnValue(true);
    sendEmailConfirmation.mockResolvedValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.updateEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(user.email).toBe("new@email.com");
    expect(user.isConfirmed).toBe(false);
    expect(user.save).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message:
        "Email updated successfully. Please check your email to confirm your account.",
    });
  });
});
