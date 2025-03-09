const jwt = require('jsonwebtoken');
const axios = require('axios');
require('cookie-parser');

const isLoggedIn = async (req, res, next) => {
    if (req.cookies.accessToken) {
        verifyToken(req, res, next);
    }else{
        next();
    }
}
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}
const mockUser = {
    id: '801ff1f5550a99e2f3fc7de6', // Use an ID from your seeded users
    email: 'Krystina18@yahoo.com',
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
}
module.exports = { isLoggedIn, verifyToken, verifyGoogleToken, mockVerifyToken };