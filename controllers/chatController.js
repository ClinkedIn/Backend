const directChatModel = require('../models/directChatModel');
const groupChatModel = require('../models/chatGroupModel');

const createDirectChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const createGroupChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getDirectChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateDirectChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getGroupChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateGroupChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getAllChats = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};




module.exports = {
    createDirectChat,
    createGroupChat,
    getDirectChat,
    getGroupChat,
    getAllChats,
    updateDirectChat,
    updateGroupChat
};