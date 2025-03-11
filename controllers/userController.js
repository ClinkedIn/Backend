const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const repostModel = require('../models/repostModel');
const reportModel = require('../models/reportModel');

const axios = require('axios')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require ('dotenv').config()

const dummyData = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


const getUser = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const createUser = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

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

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {

        // get registration data
        const { firstName, lastName, email, password, recaptchaResponseToken } = req.body;
        if (!firstName || !lastName || !email || !password||! recaptchaResponseToken ) {
            const error = new Error('all fields are required');
            error.statusCode = 400;
            throw error;
        }
        //validate email format and password requirements
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(email);
        if (!isValidEmail) {
            const error = new Error('Email not valid, Write a valid email');
            error.statusCode = 400;
            throw error;
        }
        if (!(password.length >= 8)) {
            const error = new Error('Write a valid password not less than 8 charcters');
            error.statusCode = 400;
            throw error;
        }

        //verify CAPTCHA
        const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response${recaptchaResponseToken}`;
        const captchaResponseData = await axios.post(captchaVerificationUrl);
        if (!captchaResponseData.data.success) {
            const error = new Error('CAPCHA Verification failed');
            error.statusCode = 400;
            throw error;
        }

        //check if user already exists
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            const error = new Error('The User already exist use another email');
            error.statusCode = 409;
            throw error;
        }
            
        //Hash the Password
        const hashsalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, hashsalt);
        
        //Create new User
        const newUser = await userModel.create([{ firstName, lastName, email, password: hashedPassword }], { session })
        
        const jwtToken = jwt.sign({ userId: newUser[0]._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
        
        // emailVerificationToken: uuidv4(), // Generate a unique token
        // emailVerificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000 
        // Token expires in 24 hours after that resend token
       
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: {
                token: jwtToken,
                user:newUser[0]
            }
        })


        // Send Confirmation email
        // Resend Confirmation email
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession()
        // console.error(error.statusCode);
        return res.status(error.statusCode||500).json({ message: 'Registration failed', error:`${error.message}`})

    }
}

module.exports = {
    dummyData,
    registerUser
};