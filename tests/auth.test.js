// userController.test.js
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");

const { generateTokens, protect } = require("./../middlewares/auth");

jest.mock("jsonwebtoken");
jest.mock("./../models/userModel");

const mockUser = {
  _id: "0b3169152ee6c171d25e6860",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
};

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("should generate and set access and refresh tokens", () => {
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");

      const tokens = generateTokens(mockUser, res);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe("protect", () => {
    it("should return 401 if no tokens are provided", async () => {
      await protect(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should call next if a valid access token is provided", async () => {
      req.cookies = {
        accessToken: "validAccessToken",
        refreshToken: "validRefreshToken",
      };
      jwt.verify.mockResolvedValue({ id: mockUser._id });
      userModel.findById.mockResolvedValue(mockUser);
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");
      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should try refreshing token if access token is invalid but refresh token is valid", async () => {
      req.cookies = {
        accessToken: "invalidAccess",
        refreshToken: "validRefresh",
      };

      jwt.verify
        .mockRejectedValueOnce(null) // Access token fails
        .mockResolvedValueOnce({ id: mockUser._id }); // Refresh token succeeds

      userModel.findById.mockResolvedValue(mockUser);
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");
      await protect(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if both access and refresh tokens are invalid", async () => {
      req.cookies = {
        accessToken: "invalidAccess",
        refreshToken: "invalidRefresh",
      };

      jwt.verify.mockRejectedValue(null);

      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");
      await protect(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid Token" });
    });
  });
});
