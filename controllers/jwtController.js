require("dotenv").config();
const jwt = require("jsonwebtoken");
const process = require("process");
const generateTokens = (userInfo, res) => {
  // Generate Access Token (short-lived)
  const accessToken = jwt.sign(
    {
      id: userInfo._id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }
  );

  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    {
      id: userInfo._id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Store tokens in HTTP-only cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    //path: process.env.REFRESH_TOKEN_PATH || '/'
  });

  return { accessToken, refreshToken };
};

/**
 * Verifies a JWT token.
 * @param {string} token - The token to verify.
 * @param {string} secret - The secret key for verification.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If the token is invalid or expired.
 */
const decryptToken = (token, secret) => {
  return jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      throw new Error("Invalid or expired token");
    }
    return decoded;
  });
};

/**
 * Refreshes the Access Token if a valid Refresh Token is provided.
 * @param {Object} req - The request object (expects cookies).
 * @param {Object} res - The response object to set new cookies.
 */
const refreshToken = (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the refresh token
    const { username } = decryptToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Generate new Access Token & Refresh Token
    generateTokens({ username }, res);

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    res.status(401).json({ message: error.message || "Unauthorized" });
  }
};

module.exports = {
  generateTokens,
  decryptToken,
  refreshToken,
};
