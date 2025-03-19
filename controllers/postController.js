const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const repostModel = require('../models/repostModel');
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
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Find the post
        const post = await postModel.findById(postId);
        
        // Check if post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if post is already inactive (deleted)
        if (!post.isActive) {
            return res.status(404).json({ message: 'Post not found or already deleted' });
        }
        
        // Check if user is the owner of the post
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }
        
        // Soft delete by setting isActive to false
        await postModel.findByIdAndUpdate(postId, { 
            isActive: false,
            updatedAt: Date.now()
        });
        
        res.status(200).json({ message: 'Post deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            message: 'Failed to delete post',
            error: error.message
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const { description, taggedUsers } = req.body;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Find the post
        const post = await postModel.findById(postId);
        
        // Check if post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the owner of the post
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own posts' });
        }
        
        if (!post.isActive) {
            return res.status(400).json({ message: 'Cannot update inactive posts' });
        }

        // Create update object with only allowed fields
        const updateData = {};
        
        if (description !== undefined) {
            // Validate description if provided
            if (description.trim() === '') {
                return res.status(400).json({ message: 'Post description cannot be empty' });
            }
            updateData.description = description;
        }
        
        if (taggedUsers !== undefined) {
            updateData.taggedUsers = taggedUsers;
        }
        
        // Only perform update if there are changes
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        
        // Update the post with new data and return the updated document
        const updatedPost = await postModel.findByIdAndUpdate(
            postId, 
            { 
                ...updateData,
                updatedAt: Date.now() // Explicitly update the timestamp
            },
            { new: true } // Return the modified document
        ).populate('userId', 'firstName lastName headline profilePicture');
        
        // Format response to match your API standard
        const postResponse = {
            postId: updatedPost._id,
            userId: updatedPost.userId._id,
            firstName: updatedPost.userId.firstName,
            lastName: updatedPost.userId.lastName,
            headline: updatedPost.userId.headline || "",
            profilePicture: updatedPost.userId.profilePicture,
            postDescription: updatedPost.description,
            attachments: updatedPost.attachments,
            impressionCounts: updatedPost.impressionCounts,
            commentCount: updatedPost.commentCount || 0,
            repostCount: updatedPost.repostCount || 0,
            createdAt: updatedPost.createdAt,
            updatedAt: updatedPost.updatedAt,
            taggedUsers: updatedPost.taggedUsers
        };
        
        res.status(200).json({
            message: 'Post updated successfully',
            post: postResponse
        });
        
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            message: 'Failed to update post',
            error: error.message
        });
    }
};


// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pageNumber = 1, limit = 10 } = req.query;
        const skip = (parseInt(pageNumber) - 1) * parseInt(limit);
        
        // Get current user's connections and following
        const currentUser = await userModel.findById(userId)
            .select('connections following savedPosts');
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const savedPostsSet = new Set((currentUser.savedPosts || []).map(id => id.toString()));
        // Extract IDs with proper null checks
        const connectionIds = (currentUser.connections || []).map(conn => conn.toString());
        const followedUserIds = (currentUser.following || [])
            .filter(follow => follow.entityType === 'User')
            .map(follow => follow.entity.toString());
        const followedCompanyIds = (currentUser.following || [])
            .filter(follow => follow.entityType === 'Company')
            .map(follow => follow.entity.toString());
        
        // Combine all relevant user IDs (connections + followed users + self)
        const relevantUserIds = [...new Set([...connectionIds, ...followedUserIds, userId])];
        
        // Get post IDs that were reposted by connections and followed users
        const repostInfo = await repostModel.find({
            userId: { $in: relevantUserIds },
            isActive: true
        })
        .populate('userId', 'firstName lastName profilePicture headline')
        .lean();
        
        // Extract just the post IDs from reposts
        const repostedPostIds = repostInfo.map(repost => repost.postId);
        
        // Create a map of postId -> repost info for quick lookup later
        const repostMap = {};
        repostInfo.forEach(repost => {
            if (!repostMap[repost.postId]) {
                repostMap[repost.postId] = [];
            }
            repostMap[repost.postId].push({
                isRepost: true,
                repostId: repost._id,
                reposterId: repost.userId._id,
                reposterFirstName: repost.userId.firstName,
                reposterLastName: repost.userId.lastName,
                reposterProfilePicture: repost.userId.profilePicture,
                reposterHeadline: repost.userId.headline || "",
                repostDescription: repost.description,
                repostDate: repost.createdAt
            });
        });
        
        // Query posts that are either created by relevant users or reposted by them
        const posts = await postModel.find({
            $and: [
                { isActive: true },
                {
                    $or: [
                        // Original posts from connections and followed users
                        { userId: { $in: relevantUserIds.length ? relevantUserIds : [userId] } },
                        
                        // Posts from followed companies
                        { 
                            userId: { $in: followedCompanyIds.length ? followedCompanyIds : ['000000000000000000000000'] },
                            entityType: 'Company'
                        },
                        
                        // Posts that were reposted by connections or followed users
                        { _id: { $in: repostedPostIds } }
                    ]
                }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'firstName lastName headline profilePicture')
        .lean();
        
        // Count total posts for pagination
        const total = await postModel.countDocuments({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { userId: { $in: relevantUserIds } },
                        { userId: { $in: followedCompanyIds }, entityType: 'Company' },
                        { _id: { $in: repostedPostIds } }
                    ]
                }
            ]
        });
        
        // Format posts and add repost information
        const formattedPosts = posts.map(post => {
            // Check if this post was reposted by a connection
            const repostInfo = repostMap[post._id.toString()];
            const isRepost = !!repostInfo;
            
            // For posts that have multiple reposters, use the most relevant one 
            // (e.g., first one in the array, which could be sorted by date if needed)
            const repostDetails = repostInfo ? repostInfo[0] : null;
            const isSaved = savedPostsSet.has(post._id.toString());
            return {
                postId: post._id,
                userId: post.userId._id,
                firstName: post.userId.firstName,
                lastName: post.userId.lastName,
                headline: post.userId.headline || "",
                profilePicture: post.userId.profilePicture,
                postDescription: post.description,
                attachments: post.attachments,
                impressionCounts: post.impressionCounts,
                commentCount: post.commentCount || 0,
                repostCount: post.repostCount || 0,
                createdAt: post.createdAt,
                taggedUsers: post.taggedUsers,
                isRepost: isRepost,
                isSaved: isSaved,
                // Only include repost details if this is a repost
                ...(isRepost && {
                    repostId: repostDetails.repostId,
                    reposterId: repostDetails.reposterId,
                    reposterFirstName: repostDetails.reposterFirstName,
                    reposterLastName: repostDetails.reposterLastName,
                    reposterProfilePicture: repostDetails.reposterProfilePicture,
                    reposterHeadline: repostDetails.reposterHeadline,
                    repostDescription: repostDetails.repostDescription,
                    repostDate: repostDetails.repostDate
                })
            };
        });
        
        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                total,
                page: parseInt(pageNumber),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
};


// Save a post
const savePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ _id: postId, isActive: true });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Check if user has already saved this post
        const user = await userModel.findById(userId);
        
        if (user.savedPosts && user.savedPosts.includes(postId)) {
            return res.status(400).json({ message: 'Post already saved' });
        }
        
        // Save the post to user's savedPosts array
        await userModel.findByIdAndUpdate(
            userId,
            { $push: { savedPosts: postId } },
            { new: true }
        );
        
        res.status(200).json({ message: 'Post saved successfully' });
        
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({
            message: 'Failed to save post',
            error: error.message
        });
    }
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