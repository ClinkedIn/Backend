const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const repostModel = require('../models/repostModel');
const reportModel = require('../models/reportModel');

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



module.exports = {
    dummyData
};