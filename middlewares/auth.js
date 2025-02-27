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
module.exports = { isLoggedIn, verifyToken, verifyGoogleToken };