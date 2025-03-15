const jwt = require('jsonwebtoken');
const axios = require('axios');
require('cookie-parser');

const isLoggedIn = async (req, res, next) => {
    if (req.cookies.accessToken) {
        verifyToken(req, res, next);
    } else {
        next();
    }
};
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; //jwtsign user[0]id
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
const mockUser = {
    id: process.env.USER_ID, // Use an ID from your seeded users
    email: 'Reta_Watsica78@hotmail.com',
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
module.exports = { isLoggedIn, verifyToken, verifyGoogleToken, mockVerifyToken };






// *****************************************************************************
// In middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const userModel = require('../models/userModel');

// const authenticateUser = async (req, res, next) => {
//     try {
//         // Get token from header
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Unauthorized, please login'
//             });
//         }

//         const token = authHeader.split(' ')[1];

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Check if user exists
//         const user = await userModel.findById(decoded.userId);
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Unauthorized, user not found'
//             });
//         }

//         // Add user to request
//         req.user = { userId: decoded.userId };
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: 'Unauthorized, invalid token',
//             error: error.message
//         });
//     }
// };

// module.exports = { authenticateUser };