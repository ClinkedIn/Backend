const commentModel = require('../models/commentModel');


const addComment = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updateComment = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getComment = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const deleteComment = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

module.exports = {
    addComment,
    updateComment,
    getComment,
    deleteComment
};