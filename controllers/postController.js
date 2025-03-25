const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const repostModel = require('../models/repostModel');
const reportModel = require('../models/reportModel');
const cloudinary = require('../utils/cloudinary');
const commentModel = require('../models/commentModel');
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
    try {
        const postId = req.params.postId;
        const userId = req.user.id;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Get the post and check if it's active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        }).populate('userId', 'firstName lastName headline profilePicture connections');
        
        // Check if post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check privacy settings - if post is connections only
        if (post.whoCanSee === 'connections') {
            // If user is not the post owner
            if (post.userId.toString() !== userId) {
                // Get the post owner's connections
                const connections = post.userId.connections || [];
                
                // Check if current user is in the connections
                const isConnected = connections.some(
                    connectionId => connectionId.toString() === userId
                );
                
                if (!isConnected) {
                    return res.status(403).json({ 
                        message: 'This post is only visible to the author\'s connections' 
                    });
                }
            }
            // If user is the post owner, they can see it regardless of privacy settings
        }
        
        // Check if current user has saved this post
        const currentUser = await userModel.findById(userId).select('savedPosts');
        const isSaved = currentUser && currentUser.savedPosts && 
                        currentUser.savedPosts.some(savedId => savedId.toString() === postId);
        
        // Check if post is a repost
        const repost = await repostModel.findOne({
            postId,
            isActive: true
        }).populate('userId', 'firstName lastName profilePicture headline');
        
        const isRepost = !!repost;
        
        // Format post response
        const postResponse = {
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
            updatedAt: post.updatedAt,
            taggedUsers: post.taggedUsers,
            whoCanSee: post.whoCanSee, // Include privacy setting in response
            whoCanComment: post.whoCanComment, // Include comment setting in response
            isRepost,
            isSaved,
            // Include repost details if applicable
            ...(isRepost && {
                repostId: repost._id,
                reposterId: repost.userId._id,
                reposterFirstName: repost.userId.firstName,
                reposterLastName: repost.userId.lastName,
                reposterProfilePicture: repost.userId.profilePicture,
                reposterHeadline: repost.userId.headline || "",
                repostDescription: repost.description,
                repostDate: repost.createdAt
            })
        };
        
        res.status(200).json({
            message: 'Post retrieved successfully',
            post: postResponse
        });
        
    } catch (error) {
        console.error('Error retrieving post:', error);
        res.status(500).json({
            message: 'Failed to retrieve post',
            error: error.message
        });
    }
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
        const hasNextPage = parseInt(pageNumber) < total;
        const hasPrevPage = parseInt(pageNumber) > 1;
        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                total,
                page: parseInt(pageNumber),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
                hasNextPage,
                hasPrevPage
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
        
        // Check if user has saved this post
        const user = await userModel.findById(userId);
        
        if (!user.savedPosts || !user.savedPosts.includes(postId)) {
            return res.status(400).json({ message: 'Post is not in saved posts' });
        }
        
        // Remove the post from user's savedPosts array
        await userModel.findByIdAndUpdate(
            userId,
            { $pull: { savedPosts: postId } },
            { new: true }
        );
        
        res.status(200).json({ message: 'Post removed from saved posts successfully' });
        
    } catch (error) {
        console.error('Error unsaving post:', error);
        res.status(500).json({
            message: 'Failed to remove post from saved posts',
            error: error.message
        });
    }
};

const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const { impressionType = 'like' } = req.body; // Default to 'like' if not specified
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Validate impression type
        const validImpressionTypes = ['like', 'support', 'celebrate', 'love', 'insightful', 'funny'];
        if (!validImpressionTypes.includes(impressionType)) {
            return res.status(400).json({ 
                message: 'Invalid impression type',
                validTypes: validImpressionTypes
            });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Check if user has already impressed this post
        const existingImpression = await impressionModel.findOne({
            targetId: postId,
            userId: userId,
        });
        if (existingImpression) {
            // If the user already has an active impression on this post
            if (existingImpression.type === impressionType) {
                return res.status(400).json({ 
                    message: `You have already ${impressionType}d this post` 
                });
            } else {
                // Store the old type before updating
                const oldType = existingImpression.type;
                
                // If they're changing their impression type, update it
                existingImpression.type = impressionType;
                await existingImpression.save();
                
                // Initialize impression counts if needed
                const impressionCounts = post.impressionCounts || {};
                
                // Calculate new counts
                const oldTypeCount = Math.max(0, (impressionCounts[oldType] || 1) - 1);
                const newTypeCount = (impressionCounts[impressionType] || 0) + 1;
                
                // Use findByIdAndUpdate with specific field updates to avoid validation issues
                const updatedPost = await postModel.findByIdAndUpdate(
                    postId,
                    { 
                        [`impressionCounts.${oldType}`]: oldTypeCount,
                        [`impressionCounts.${impressionType}`]: newTypeCount
                    },
                    { new: true }
                );
                
                return res.status(200).json({ 
                    message: `Impression changed from ${oldType} to ${impressionType}`,
                    impressionCounts: updatedPost.impressionCounts
                });
            }
        }
        
        // Create new impression
        const newImpression = await impressionModel.create({
            targetId: postId,
            targetType: "Post",
            userId,
            type: impressionType,
            isActive: true
        });
        // Initialize impression counts if needed
        const impressionCounts = post.impressionCounts || {};
        const typeCount = (impressionCounts[impressionType] || 0) + 1;
        const totalCount = (impressionCounts.total || 0) + 1;
        
        // Use findByIdAndUpdate with specific field updates to avoid validation issues
        const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            { 
                [`impressionCounts.${impressionType}`]: typeCount,
                'impressionCounts.total': totalCount
            },
            { new: true }
        );
        
        res.status(200).json({ 
            message: `Post ${impressionType}d successfully`,
            impressionCounts: updatedPost.impressionCounts
        });
        
    } catch (error) {
        console.error(`Error ${req.body.impressionType || 'like'}ing post:`, error);
        res.status(500).json({
            message: `Failed to ${req.body.impressionType || 'like'} post`,
            error: error.message
        });
    }
};

const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Check if user has an active impression on this post
        const existingImpression = await impressionModel.findOne({
            targetId: postId,
            userId,
        });
        
        if (!existingImpression) {
            return res.status(400).json({ message: 'You have not reacted to this post' });
        }
        
        // Get the impression type before deleting
        const impressionType = existingImpression.type;
        
        // Hard delete the impression
        await impressionModel.findByIdAndDelete(existingImpression._id);
        
        // Initialize impression counts if needed
        const impressionCounts = post.impressionCounts || {};
        const typeCount = Math.max(0, (impressionCounts[impressionType] || 0) - 1);
        const totalCount = Math.max(0, (impressionCounts.total || 0) - 1);
        
        // Use findByIdAndUpdate with specific field updates to avoid validation issues
        const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            { 
                [`impressionCounts.${impressionType}`]: typeCount,
                'impressionCounts.total': totalCount
            },
            { new: true }
        );
        
        res.status(200).json({
            message: `Post ${impressionType} removed successfully`,
            impressionCounts: updatedPost.impressionCounts
        });
        
    } catch (error) {
        console.error('Error removing post impression:', error);
        res.status(500).json({
            message: 'Failed to remove post impression',
            error: error.message
        });
    }
};

// Reposting a post
const repostPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const { description } = req.body;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Create new repost
        const newRepost = await repostModel.create({
            userId,
            postId,
            description: description || '',
            isActive: true
        });
        
        // Increment repost count on original post
        const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            { $inc: { repostCount: 1 } },
            { new: true }
        );
        
        // Get user details for response
        const user = await userModel.findById(userId).select('firstName lastName headline profilePicture');
        
        // Format response
        const repostResponse = {
            repostId: newRepost._id,
            originalPostId: postId,
            userId: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            headline: user.headline || "",
            profilePicture: user.profilePicture,
            repostDescription: newRepost.description,
            createdAt: newRepost.createdAt,
        };
        
        res.status(201).json({
            message: 'Post reposted successfully',
            repost: repostResponse
        });
        
    } catch (error) {
        console.error('Error reposting post:', error);
        res.status(500).json({
            message: 'Failed to repost post',
            error: error.message
        });
    }
};

const deleteRepost = async (req, res) => {
    try {
        const { repostId } = req.params;
        const userId = req.user.id;
        
        // Validate input
        if (!repostId) {
            return res.status(400).json({ message: 'Repost ID is required' });
        }
        
        // Find the repost
        const repost = await repostModel.findById(repostId);
        
        // Check if repost exists
        if (!repost) {
            return res.status(404).json({ message: 'Repost not found' });
        }
        
        // Check if repost is already inactive (deleted)
        if (!repost.isActive) {
            return res.status(404).json({ message: 'Repost not found or already deleted' });
        }
        
        // Check if user is the owner of the repost
        if (repost.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own reposts' });
        }
        
        // Get the original post ID before updating the repost
        const postId = repost.postId;
        
        // Soft delete by setting isActive to false
        await repostModel.findByIdAndUpdate(repostId, { 
            isActive: false
        });
        
        // Get the original post
        const post = await postModel.findById(postId);
        
        if (post && post.repostCount > 0) {
            // Decrement repost count on original post (ensure it doesn't go below 0)
            await postModel.findByIdAndUpdate(
                postId,
                { $inc: { repostCount: -1 } }
            );
        }
        
        res.status(200).json({ message: 'Repost deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting repost:', error);
        res.status(500).json({
            message: 'Failed to delete repost',
            error: error.message
        });
    }
};

// Report a post
const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const { policy, dontWantToSee } = req.body;
        
        // Validate required inputs
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        if (!policy) {
            return res.status(400).json({ message: 'Report reason (policy) is required' });
        }
        
        // Validate policy enum value
        const validPolicies = [
            // General content violations
            "Harassment", 
            "Fraud or scam", 
            "Spam", 
            "Misinformation", 
            "Hateful speech", 
            "Threats or violence", 
            "Self-harm", 
            "Graphic content", 
            "Dangerous or extremist organizations", 
            "Sexual content", 
            "Fake account", 
            "Child exploitation", 
            "Illegal goods and services", 
            "Infringement",
            // User-specific violations
            "This person is impersonating someone", 
            "This account has been hacked", 
            "This account is not a real person"
        ];
        
        if (!validPolicies.includes(policy)) {
            return res.status(400).json({ 
                message: 'Invalid report reason',
                validReasons: validPolicies
            });
        }
        
        // Validate dontWantToSee if provided
        if (dontWantToSee) {
            const validReasons = [
                "I'm not interested in the author", 
                "I'm not interested in this topic", 
                "I've seen too many posts on this topic", 
                "I've seen this post before", 
                "This post is old", 
                "It's something else"
            ];
            
            if (!validReasons.includes(dontWantToSee)) {
                return res.status(400).json({ 
                    message: 'Invalid "don\'t want to see" reason',
                    validReasons
                });
            }
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        
        // Create new report
        const newReport = await reportModel.create({
            userId,
            reportedId: postId,
            reportedType: 'Post',
            policy,
            ...(dontWantToSee && { dontWantToSee })
        });
        
        res.status(201).json({ 
            message: 'Post reported successfully',
            reportId: newReport._id
        });
        
    } catch (error) {
        console.error('Error reporting post:', error);
        res.status(500).json({
            message: 'Failed to report post',
            error: error.message
        });
    }
};

const getPostImpressions = async (req, res) => {
    try {
        const { postId } = req.params;
        const { type, page = 1, limit = 10 } = req.query;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Build query for impressions
        const query = {
            targetId: postId,
            targetType: "Post"
        };
        
        // Add type filter if provided
        if (type) {
            const validImpressionTypes = ['like', 'support', 'celebrate', 'love', 'insightful', 'funny'];
            if (!validImpressionTypes.includes(type)) {
                return res.status(400).json({ 
                    message: 'Invalid impression type',
                    validTypes: validImpressionTypes
                });
            }
            query.type = type;
        }
        
        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;
        
        // Get total count for pagination metadata
        const totalImpressions = await impressionModel.countDocuments(query);
        
        // Find impressions with pagination
        const impressions = await impressionModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skipIndex)
            .limit(limitNum);
            
        // Get user details for each impression
        const userIds = impressions.map(impression => impression.userId);
        const users = await userModel.find(
            { _id: { $in: userIds } },
            'firstName lastName headline profilePicture'
        );
        
        // Create a map of user details for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = {
                firstName: user.firstName,
                lastName: user.lastName,
                headline: user.headline || "",
                profilePicture: user.profilePicture
            };
        });
        
        // Combine impression data with user details
        const impressionsWithUserInfo = impressions.map(impression => {
            const user = userMap[impression.userId.toString()] || {};
            return {
                impressionId: impression._id,
                userId: impression.userId,
                type: impression.type,
                createdAt: impression.createdAt,
                ...user
            };
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalImpressions / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        // Get counts for each impression type
        const impressionCounts = post.impressionCounts || {};
        
        // Return results with pagination metadata and counts for each impression type
        res.status(200).json({
            message: "Impressions retrieved successfully",
            impressions: impressionsWithUserInfo,
            counts: {
                like: impressionCounts.like || 0,
                support: impressionCounts.support || 0,
                celebrate: impressionCounts.celebrate || 0,
                love: impressionCounts.love || 0,
                insightful: impressionCounts.insightful || 0,
                funny: impressionCounts.funny || 0,
                total: impressionCounts.total || 0
            },
            pagination: {
                totalImpressions,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
                hasNextPage,
                hasPrevPage
            }
        });
        
    } catch (error) {
        console.error('Error getting post impressions:', error);
        res.status(500).json({
            message: 'Failed to get impressions',
            error: error.message
        });
    }
};

const getPostReposts = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        
        // Validate input
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        
        // Check if post exists and is active
        const post = await postModel.findOne({ 
            _id: postId, 
            isActive: true 
        }).populate('userId', 'firstName lastName headline profilePicture')
        .lean();
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found or inactive' });
        }
        
        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;
        
        // Get total count for pagination metadata
        const totalReposts = await repostModel.countDocuments({
            postId,
            isActive: true
        });
        
        // Find reposts with pagination
        const reposts = await repostModel.find({
            postId,
            isActive: true
        })
            .sort({ createdAt: -1 })
            .skip(skipIndex)
            .limit(limitNum)
            .populate('userId', 'firstName lastName headline profilePicture')
            .lean();
        
        // Get current user's saved posts for checking if this post is saved
        const currentUser = await userModel.findById(userId).select('savedPosts');
        const savedPostsSet = new Set((currentUser.savedPosts || []).map(id => id.toString()));
        const isSaved = savedPostsSet.has(postId.toString());
        
        // Format reposts exactly like in getAllPosts
        const formattedReposts = reposts.map(repost => {
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
                isRepost: true,
                isSaved: isSaved,
                // Repost specific details
                repostId: repost._id,
                reposterId: repost.userId._id,
                reposterFirstName: repost.userId.firstName,
                reposterLastName: repost.userId.lastName,
                reposterProfilePicture: repost.userId.profilePicture,
                reposterHeadline: repost.userId.headline || "",
                repostDescription: repost.description || "",
                repostDate: repost.createdAt
            };
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalReposts / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        // Return results with pagination metadata in the same format as getAllPosts
        res.status(200).json({
            posts: formattedReposts,
            pagination: {
                total: totalReposts,
                page: pageNum,
                limit: limitNum,
                pages: totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
        
    } catch (error) {
        console.error('Error getting post reposts:', error);
        res.status(500).json({
            message: 'Failed to get reposts',
            error: error.message
        });
    }
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
    updatePost,
    getPostImpressions,
    getPostReposts,
};