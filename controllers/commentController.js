const commentModel = require('../models/commentModel');
const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const { uploadFile, deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const addComment = async (req, res) => {
    try {
        const { postId, commentContent, taggedUsers, parentComment } = req.body;
        const userId = req.user.id;
        const firstName = req.user.firstName;
        const lastName = req.user.lastName;
        const profilePicture = req.user.profilePicture;
        const headline = req.user.headline;
        
        // Validate required input
        if (!postId || !(commentContent||req.file)) {
            return res.status(400).json({ message: "Post ID and comment content are required" });
        }

        // Check if post exists
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Handle comment attachment if provided
        let attachmentUrl = null;
        if (req.file) {
            // Using Multer - file is available as req.file
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Please upload an image file' });
            }
            
            // Pass the buffer and mimetype to uploadFile
            try {
                const result = await uploadFile(req.file.buffer, req.file.mimetype);
                attachmentUrl = result.url;
            } catch (error) {
                console.error('Error uploading file:', error);
                return res.status(500).json({ message: 'Failed to upload image', error: error.message });
            }
        } else if (req.body.commentAttachment) {
            // If it's a URL string passed in the request body
            attachmentUrl = req.body.commentAttachment;
        }

        // Prepare tagged users data with required fields
        let processedTaggedUsers = [];
        if (taggedUsers && taggedUsers.length > 0) {
            // If taggedUsers is a string, try to parse it as JSON
            const parsedUsers = typeof taggedUsers === 'string' ? JSON.parse(taggedUsers) : taggedUsers;
            
            processedTaggedUsers = parsedUsers.map(user => ({
                userId: user.userId,
                userType: user.userType || "User",
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: user.companyName
            }));
        }

        // Create the comment
        const newComment = new commentModel({
            userId,
            postId,
            commentContent,
            commentAttachment: attachmentUrl,
            firstName,
            lastName,
            headline,
            profilePicture,
            taggedUsers: processedTaggedUsers,
            parentComment: parentComment || null
        });

        // Save the comment
        await newComment.save();

        // If it's a reply to another comment, update the parent comment's replies and replyCount
        if (parentComment) {
            await commentModel.findByIdAndUpdate(
                parentComment,
                {
                    $push: { replies: newComment._id },
                    $inc: { replyCount: 1 }
                }
            );
        }

        // Update post's comment count
        await postModel.findByIdAndUpdate(
            postId,
            { $inc: { commentCount: 1 } }
        );
        const commentResponse = {
            ...newComment.toObject(),
            firstName,
            lastName,
            headline,
            profilePicture
        };
        res.status(201).json({
            message: 'Comment added successfully',
            id: newComment._id,
            comment: commentResponse
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            message: 'Failed to add comment',
            error: error.message
        });
    }
};
const updateComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const { commentContent, taggedUsers } = req.body;
        const userId = req.user.id;
        const firstName = req.user.firstName;
        const lastName = req.user.lastName;
        const profilePicture = req.user.profilePicture;
        const headline = req.user.headline;
        // Validate required input
        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }
        
        if (!commentContent && !taggedUsers) {
            return res.status(400).json({ message: "No changes provided for update" });
        }

        // Find the comment by ID
        const comment = await commentModel.findById(commentId);
        
        // Check if comment exists
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is the owner of the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        // Update comment content if provided
        if (commentContent) {
            comment.commentContent = commentContent;
        }

        // Update tagged users if provided
        if (taggedUsers) {
            // Process tagged users data
            let processedTaggedUsers = [];
            // If taggedUsers is a string, try to parse it as JSON
            const parsedUsers = typeof taggedUsers === 'string' ? JSON.parse(taggedUsers) : taggedUsers;
            
            processedTaggedUsers = parsedUsers.map(user => ({
                userId: user.userId,
                userType: user.userType || "User",
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: user.companyName
            }));
            
            comment.taggedUsers = processedTaggedUsers;
        }
        
        // Save the updated comment
        await comment.save();
        const commentResponse = {
            ...comment.toObject(),
            firstName,
            lastName,
            headline,
            profilePicture
        };
        res.status(201).json({
            message: 'Comment updated successfully',
            id: comment._id,
            comment: commentResponse
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            message: 'Failed to update comment',
            error: error.message
        });
    }
};
const getComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        
        // Validate comment ID
        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }
        
        // Find the comment by ID
        const comment = await commentModel.findById(commentId);
        
        // Check if comment exists and is active
        if (!comment || !comment.isActive) {
            return res.status(404).json({ message: "Comment not found" });
        }
        
        // Get user info to include in response
        const user = await userModel.findById(comment.userId, 'firstName lastName headline profilePicture');
        
        // Create a response object with user information
        const commentResponse = {
            ...comment.toObject(),
            firstName: user?.firstName,
            lastName: user?.lastName,
            headline: user?.headline,
            profilePicture: user?.profilePicture
        };
        
        res.status(200).json({
            message: "Comment retrieved successfully",
            comment: commentResponse
        });
    } catch (error) {
        console.error('Error getting comment:', error);
        res.status(500).json({
            message: 'Failed to get comment',
            error: error.message
        });
    }
};

const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skipIndex = (page - 1) * limit;
        
        // Validate post ID
        if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
        }
        
        // Check if post exists
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Get total count of active top-level comments for this post
        const totalComments = await commentModel.countDocuments({ 
            postId, 
            isActive: true,
            parentComment: null // Ensuring we only count top-level comments
        });
        
        // Find comments for the post with pagination
        // Only get top-level comments (not replies)
        const comments = await commentModel.find({ 
            postId, 
            isActive: true,
            parentComment: null // This ensures we only get top-level comments
        })
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skipIndex)
        .limit(limit);
        
        // Enhance comments with user information
        const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
            const user = await userModel.findById(comment.userId, 'firstName lastName headline profilePicture');
            
            return {
                ...comment.toObject(),
                firstName: user?.firstName,
                lastName: user?.lastName,
                headline: user?.headline,
                profilePicture: user?.profilePicture
            };
        }));
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalComments / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
            message: "Comments retrieved successfully",
            comments: commentsWithUserInfo,
            pagination: {
                totalComments,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Error getting post comments:', error);
        res.status(500).json({
            message: 'Failed to get comments',
            error: error.message
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;

        // Validate comment ID
        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }

        // Find the comment by ID
        const comment = await commentModel.findById(commentId);
        
        // Check if comment exists
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is the owner of the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        // Get parent comment ID before soft deletion (for updating counts)
        const postId = comment.postId;
        const parentComment = comment.parentComment;
        
        // Set isActive to false (soft delete)
        comment.isActive = false;
        await comment.save();
        
        // If it was a reply to another comment, update parent's reply count
        // but keep the reply in the array for data integrity
        if (parentComment) {
            await commentModel.findByIdAndUpdate(
                parentComment,
                {
                    $inc: { replyCount: -1 }
                }
            );
        }
        
        // Update post's comment count
        await postModel.findByIdAndUpdate(
            postId,
            { $inc: { commentCount: -1 } }
        );

        res.status(200).json({
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            message: 'Failed to delete comment',
            error: error.message
        });
    }
};

module.exports = {
    addComment,
    updateComment,
    getComment,
    getPostComments,
    deleteComment
};