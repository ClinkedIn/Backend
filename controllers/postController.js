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
    res.status(200).json({ message: 'Dummy data' });
};

const updatePost = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pageNumber = 1, limit = 10 } = req.query;
        const skip = (parseInt(pageNumber) - 1) * parseInt(limit);
        
        // Get current user's connections and following
        const currentUser = await userModel.findById(userId)
            .select('connections following');
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
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