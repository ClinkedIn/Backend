const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const cloudinary = require('../utils/cloudinary');
//import { ObjectId } from 'mongodb';
const mongoose = require('mongoose')
const { uploadFile, uploadMultipleImages, deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const { uploadPostAttachments } = require('../utils/postUtils');
const impressionModel = require('../models/impressionModel');
// Specific Post
const createPost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user.id; // From authentication middleware
        let { description, taggedUsers, whoCanSee, whoCanComment } = req.body;
        
        // Validate required fields
        if (!description || description.trim() === '') {
            return res.status(400).json({ message: 'Post description is required' });
        }
        
        // Initialize post object
        const newPostData = {
            userId,
            description,
            attachments: [],
            taggedUsers: taggedUsers || [],
            whoCanSee: whoCanSee || 'anyone',
            whoCanComment: whoCanComment || 'anyone'
        };

        // Handle file uploads if present
        if (req.files && req.files.length > 0) {
            try {
                // Use the helper function to handle attachments
                newPostData.attachments = await uploadPostAttachments(req.files);
            } catch (uploadError) {
                return res.status(400).json({ message: uploadError.message });
            }
        }

        // Create the post
        const newPost = await postModel.create(newPostData);
        
        // Get user information separately without changing the post structure
        const user = await userModel.findById(userId).select('firstName lastName headline');
        
        // Count impression types if needed (depends on your impression model structure)
        // For now, we'll just provide the count of impressions
        
        // Create a custom response object with the requested fields
        const postResponse = {
            postId: newPost._id,
            userId: userId, // Original user ID reference
            firstName: user.firstName,
            lastName: user.lastName,
            headline: user.headline || "",
            postDescription: newPost.description,
            attachments: newPost.attachments,
            impressionTypes: [], // You'll need to implement this based on your data structure
            impressionCounts: newPost.impressionCounts,
            commentCount: newPost.commentCount,
            repostCount: newPost.repostCount,
            createdAt: newPost.createdAt,
            taggedUsers: newPost.taggedUsers
        };
        //add the post id to the user's post array
        await userModel.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            message: 'Post created successfully',
            post: postResponse
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating post:', error);
        res.status(500).json({
            message: 'Failed to create post',
            error: error.message
        });
    }
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
    repostPost,
    deleteRepost,
    reportPost,
    getPost,
    deletePost,
    updatePost
};