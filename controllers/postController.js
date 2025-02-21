const postModel = require('../models/postModel');

// Specific Post
const createPost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getPost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const deletePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const updatePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Get all posts
const getAllPosts = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Save a post
const savePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const unsavePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Like a post
const likePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const unlikePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Comment on a post
const commentPost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const deleteComment = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// Reposting a post
const repostPost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const deleteRepost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Report a post
const reportPost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};



module.exports = {
    createPost,
    getAllPosts,
    savePost,
    unsavePost,
    likePost,
    unlikePost,
    commentPost,
    deleteComment,
    repostPost,
    deleteRepost,
    reportPost,
    createPost,
    getPost,
    deletePost,
    updatePost
};