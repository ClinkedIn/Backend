const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const repostModel = require('../models/repostModel');
const reportModel = require('../models/reportModel');

const axios = require('axios');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { sendEmailConfirmation } = require('../utils/emailconfirmationService');
const { validateEmail, validatePassword } = require('../utils/validateEmailPassword');
const { generateTokens } = require('./jwtController');

const dummyData = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


const getUser = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// const createUser = async (req, res) => {
//     res.status(200).json({ message: 'Dummy data' });
// };

const sendConnectionRequest = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const acceptConnectionRequest = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const declineConnectionRequest = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const removeConnection = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const addProfilePicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateProfilePicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const removeProfilePicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const addCoverPicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateCoverPicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const removeCoverPicture = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const addResume = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateResume = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const removeResume = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


const registerUser = async (req, res) => {
    try {

        // get registration data
        const { firstName, lastName, email, password, recaptchaResponseToken } = req.body;
        if (!firstName || !lastName || !email || !password || !recaptchaResponseToken) {
            return res.status(400).json({ message: 'all fields are required' });
        }
        //validate email format and password requirements
        const isValidEmail = validateEmail(email);
        if (!isValidEmail) {
            return res.status(400).json({ message: 'Email not valid, Write a valid email' });
        }
        const isValidPassword = validatePassword(password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: 'Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long.'
            });
        }

        //verify CAPTCHA
        const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response${recaptchaResponseToken}`;
        const captchaResponseData = await axios.post(captchaVerificationUrl);
        if (!captchaResponseData.data.success) {
            return res.status(400).json({
                success: false,
                message: 'CAPCHA Verification failed'
            });
        }

        //check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'The User already exist use another email' });
        }

        //Hash the Password
        const hashsalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, hashsalt);

        //start a session
        const session = await mongoose.startSession();
        session.startTransaction();
        //Create new User
        const newUser = await userModel.create([{ firstName, lastName, email, password: hashedPassword, isEmailConfirmed: false }], { session });

        // use generateTokens from jwt controller and fix it ✅
        const jwtrefreshToken = generateTokens(newUser[0], res);
        console.log(`refresh tokeen:  ${jwtrefreshToken}`);
        await session.commitTransaction();
        session.endSession();

        // remove get confirm-email end point and directly send from here ✅
        const isEmailSent = await sendEmailConfirmation(newUser[0]._id);
        if (!isEmailSent.success) {
            return res.status(400).json({
                success: false,
                message: isEmailSent.error
            });
        }
        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to confirm your account.',
            data: {
                token: jwtrefreshToken,
                user: newUser[0]
            }
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        // console.error(error.statusCode);
        return res.status(error.statusCode || 500).json({
            success: false, message: 'Registration failed',
            error: `${error.message}`
        });

    }
};


const confirmEmail = async (req, res) => {
    try {
        const { emailVerificationToken } = req.body;
        if (!emailVerificationToken) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });
        }

        const verificationDate = new Date(Date.now());
        const user = await userModel.findOne({
            emailVerificationToken: emailVerificationToken,
            emailVerificationExpiresAt: { $gt: verificationDate }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        user.isConfirmed = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpiresAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email is confirmed successfully"
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Email confirmation failed",
            error: error.message
        });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        });
    } catch (error) {
        ;
    }
};
module.exports = {
    dummyData,
    registerUser,
    confirmEmail,
    login

};