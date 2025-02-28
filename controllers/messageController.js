const MessageModel = require('../models/chatMessageModel');

// Create a new message.
const createMessage = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// Get a message.
const getMessage = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// Update a message.
const updateMessage = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// Delete a message.
const deleteMessage = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

module.exports = {
    createMessage,
    getMessage,
    updateMessage,
    deleteMessage
};