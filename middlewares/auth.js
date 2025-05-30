const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const userModel = require("./../models/userModel");

const generateTokens = (userInfo, res) => {
  // Generate Access Token (short-lived)
  const accessToken = jwt.sign(
    {
      id: userInfo._id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      profilePicture: userInfo.profilePicture,
      headline: userInfo.headline,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    {
      id: userInfo._id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      profilePicture: userInfo.profilePicture,
      headline: userInfo.headline,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "120m" }
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

const decryptToken = async (req, res, decoded, next) => {
  const currentUser = await userModel.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json({ message: "Unauthorized, the user no longer exists" });
  }
  generateTokens(currentUser, res);

  req.user = decoded;
  next();
};

const tryRefreshToken = async (req, res, refreshToken, next) => {
  try {
    const refreshDecoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    return decryptToken(req, res, refreshDecoded, next);
  } catch (refreshError) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const protect = async (req, res, next) => {
  const { refreshToken, accessToken } = req.cookies;

  if (!refreshToken && !accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      return decryptToken(req, res, decoded, next);
    } catch (err) {
      return tryRefreshToken(req, res, refreshToken, next);
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid Token" });
  }
};
const checkAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUser = await userModel.findById(req.user.id);

  if (!currentUser) {
    return res
      .status(401)
      .json({ message: "Unauthorized, the user no longer exists" });
  }

  if (!currentUser.isSuperAdmin) {
    return res
      .status(403)
      .json({ message: "Unauthorized, Admin access required" });
  }
  next();
};

const mockUser = {
  id: "3dddd459ad9b0142faafeb7b", // Use an ID from your seeded users
  email: "Reta_Watsica78@hotmail.com",
  // Add other user properties you need
};

const mockVerifyToken = async (req, res, next) => {
  req.user = mockUser;
  next();
};
const verifyGoogleToken = async (req, res, next) => {
  try {
    const token = req.cookies.googleToken;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
module.exports = {
  generateTokens,
  verifyGoogleToken,
  mockVerifyToken,
  protect,
  checkAdmin,
};
