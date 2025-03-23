// userController.test.js
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

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
            if (
                query.email === "existing@example.com" &&
                query.isActive === true
            ) {
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
            .mockImplementationOnce(() => Promise.resolve({ _id: "deactivatedUserId" }));

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
/* describe("resendConfirmationEmail", () => {
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
}); */

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
    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    await userController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Account created sucessfully",
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

    // ✅ Mock Firebase authentication correctly
    firebaseAdmin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });

    // ✅ Mock existing user with null googleId and a working save function
    const existingUser = {
      _id: "existingUserId",
      googleId: null,
      isActive: true,
      save: jest.fn().mockResolvedValue(true),
    };
    // ✅ Mock database queries
    userModel.findOne = jest.fn().mockResolvedValue(existingUser);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await userController.googleLogin(req, res);

    // ✅ Now, existingUser.googleId should be updated
    expect(existingUser.googleId).toBe("googleUid");
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
    firebaseAdmin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(decoded),
    });
    const existingUser = {
      _id: "existingUserId",
      googleId: "googleUid",
      isActive: true,
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
      isActive: true,
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

  /*   it("should return 401 if the user created his account using google only", async () => {
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
  }); */

  it("should update email successfully", async () => {
    req.user = { id: "someUserId" };
    req.body = { newEmail: "new@email.com", password: "correct" };
    const user = {
      id: "someUserId",
      password: "hashed",
      email: "notyou@gmail.com", // ✅ Ensure email is present
      isConfirmed: true,
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    const anotherUser = {
      email: "not the same",
      save: jest.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(anotherUser);
    userModel.findById.mockResolvedValue(user);
    validateEmail.mockReturnValue(true);
    sendEmailConfirmation.mockResolvedValue(true);
    generateTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    await userController.updateEmail(req, res);
    expect(user.email).toBe("new@email.com");
    expect(user.isConfirmed).toBe(false);
    expect(user.save).toHaveBeenCalled();
    expect(sendEmailConfirmation).toHaveBeenCalledWith(user.id || user._id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message:
        "Email updated successfully. Please check your email to confirm your account.",
    });
  });
});
