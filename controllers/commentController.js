const commentModel = require("../models/commentModel");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");
const impressionModel = require("../models/impressionModel");
const { uploadFile, deleteFileFromUrl } = require("../utils/cloudinaryUpload");
const { sendNotification } = require("../utils/Notification");
const addComment = async (req, res) => {
  try {
    const { postId, commentContent, taggedUsers, parentComment } = req.body;
    const userId = req.user.id;
    const firstName = req.user.firstName;
    const lastName = req.user.lastName;
    const profilePicture = req.user.profilePicture;
    const headline = req.user.headline;

    // Validate required input
    if (!postId || !(commentContent || req.file)) {
      return res
        .status(400)
        .json({ message: "Post ID and comment content are required" });
    }
    // Check if post exists
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const postOwner = await userModel.findById(post.userId);
    // Check if the post comments is set to connections only and the user is not connected
    if (
      post.commentSetting === "connections" &&
      !req.user.connections.includes(post.userId)
    ) {
      return res.status(403).json({
        message: "You can only comment on posts from your connections",
      });
    }
    // Check if the user is blocked by the post owner
    if (postOwner && postOwner.blockedUsers.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You can't comment on this post" });
    }
    //Check if the user blocked the post owner
    const user = await userModel.findById(userId);
    if (post.userId && user.blockedUsers.includes(post.userId)) {
      return res
        .status(403)
        .json({ message: "You can't comment on this post" });
    }
    //check if comments is disabled
    if (
      post.commentSetting === "noOne" ||
      (post.commentSetting === "connections" &&
        !req.user.connections.includes(post.userId))
    ) {
      return res
        .status(403)
        .json({ message: "Comments are disabled for this post" });
    }
    //Check
    // Handle comment attachment if provided
    let attachmentUrl = null;
    if (req.file) {
      // Using Multer - file is available as req.file
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Please upload an image file" });
      }

      // Pass the buffer and mimetype to uploadFile
      try {
        const result = await uploadFile(req.file.buffer, req.file.mimetype);
        attachmentUrl = result.url;
      } catch (error) {
        console.error("Error uploading file:", error);
        return res
          .status(500)
          .json({ message: "Failed to upload image", error: error.message });
      }
    } else if (req.body.commentAttachment) {
      // If it's a URL string passed in the request body
      attachmentUrl = req.body.commentAttachment;
    }

    // Prepare tagged users data with required fields
    let processedTaggedUsers = [];
    if (taggedUsers && taggedUsers.length > 0) {
      // If taggedUsers is a string, try to parse it as JSON
      const parsedUsers =
        typeof taggedUsers === "string" ? JSON.parse(taggedUsers) : taggedUsers;

      processedTaggedUsers = parsedUsers.map((user) => ({
        userId: user.userId,
        userType: user.userType || "User",
        firstName: user.firstName,
        lastName: user.lastName
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
      parentComment: parentComment || null,
    });

    // Save the comment
    await newComment.save();

    // If it's a reply to another comment, update the parent comment's replies and replyCount
    if (parentComment) {
      await commentModel.findByIdAndUpdate(parentComment, {
        $push: { replies: newComment._id },
        $inc: { replyCount: 1 },
      });
    }

    // Update post's comment count
    await postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    const commentResponse = {
      ...newComment.toObject(),
      firstName,
      lastName,
      headline,
      profilePicture,
    };
    // Send notification to the post owner if the comment is not from them
    sendNotification(user, postOwner, "comment", newComment);
    res.status(201).json({
      message: "Comment added successfully",
      id: newComment._id,
      comment: commentResponse,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
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
      return res
        .status(400)
        .json({ message: "No changes provided for update" });
    }

    // Find the comment by ID
    const comment = await commentModel.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
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
      const parsedUsers =
        typeof taggedUsers === "string" ? JSON.parse(taggedUsers) : taggedUsers;

      processedTaggedUsers = parsedUsers.map((user) => ({
        userId: user.userId,
        userType: user.userType || "User",
        firstName: user.firstName,
        lastName: user.lastName
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
      profilePicture,
    };
    res.status(201).json({
      message: "Comment updated successfully",
      id: comment._id,
      comment: commentResponse,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
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
    const user = await userModel.findById(
      comment.userId,
      "firstName lastName headline profilePicture"
    );

    // Create a response object with user information
    const commentResponse = {
      ...comment.toObject(),
      firstName: user?.firstName,
      lastName: user?.lastName,
      headline: user?.headline,
      profilePicture: user?.profilePicture,
    };

    res.status(200).json({
      message: "Comment retrieved successfully",
      comment: commentResponse,
    });
  } catch (error) {
    console.error("Error getting comment:", error);
    res.status(500).json({
      message: "Failed to get comment",
      error: error.message,
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const userId = req.user.id;
    
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
      parentComment: null, // Ensuring we only count top-level comments
    });
    
    // Check if post is set to connections only and the user is not connected
    const user = await userModel.findById(req.user.id);
    if (
      post.commentSetting === "connections" &&
      req.user.connections.includes(post.userId) &&
      post.userId.toString() !== user
    ) {
      return res.status(403).json({
        message: "You can only view comments on posts from your connections",
      });
    }
    
    //c check if the user is blocked by the post owner
    const postOwner = await userModel.findById(post.userId);
    if (postOwner.blockedUsers.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can't view comments on this post" });
    }
    
    //Check if the user blocked the post owner
    if (user.blockedUsers.includes(post.userId)) {
      return res
        .status(403)
        .json({ message: "You can't view comments on this post" });
    }
    
    // Find comments for the post with pagination
    // Only get top-level comments (not replies)
    const comments = await commentModel
      .find({
        postId,
        isActive: true,
        parentComment: null, // This ensures we only get top-level comments
      })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skipIndex)
      .limit(limit);

    // Get all user impressions for these comments in a single query
    const commentIds = comments.map(comment => comment._id);
    const userImpressions = await impressionModel.find({
      targetId: { $in: commentIds },
      userId: userId,
      targetType: "Comment"
    }).lean();

    // Create a map of impressions by comment ID for quick lookup
    const impressionMap = {};
    userImpressions.forEach(impression => {
      impressionMap[impression.targetId.toString()] = impression;
    });

    // Enhance comments with user information and isLiked status
    const commentsWithUserInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await userModel.findById(
          comment.userId,
          "firstName lastName headline profilePicture"
        );

        // Check if user has liked this comment
        const isLiked = !!impressionMap[comment._id.toString()];
        
        return {
          ...comment.toObject(),
          firstName: user?.firstName,
          lastName: user?.lastName,
          headline: user?.headline,
          profilePicture: user?.profilePicture,
          isLiked: {
            like: isLiked,
            type : impressionMap[comment._id.toString()]?.type || null,
          }
        };
      })
    );

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
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error getting post comments:", error);
    res.status(500).json({
      message: "Failed to get comments",
      error: error.message,
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
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
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
      await commentModel.findByIdAndUpdate(parentComment, {
        $inc: { replyCount: -1 },
      });
    }

    // Update post's comment count
    await postModel.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

    await notificationModel.findOneAndDelete({
      resourceId: comment._id,
    });

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Get the current user's ID
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // Validate comment ID
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Check if parent comment exists and is active
    const parentComment = await commentModel.findById(commentId);
    if (!parentComment || !parentComment.isActive) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get total count of active replies for this comment
    const totalReplies = await commentModel.countDocuments({
      parentComment: commentId,
      isActive: true,
    });

    // Find replies for the comment with pagination
    const replies = await commentModel
      .find({
        parentComment: commentId,
        isActive: true,
      })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skipIndex)
      .limit(limit);

    // Get all user impressions for these replies in a single query
    const replyIds = replies.map(reply => reply._id);
    const userImpressions = await impressionModel.find({
      targetId: { $in: replyIds },
      userId: userId,
      targetType: "Comment"
    }).lean();

    // Create a map of impressions by reply ID for quick lookup
    const impressionMap = {};
    userImpressions.forEach(impression => {
      impressionMap[impression.targetId.toString()] = impression;
    });

    // Enhance replies with user information and isLiked status
    const repliesWithUserInfo = await Promise.all(
      replies.map(async (reply) => {
        const user = await userModel.findById(
          reply.userId,
          "firstName lastName headline profilePicture"
        );

        // Check if user has liked this reply
        const isLiked = !!impressionMap[reply._id.toString()];
        
        return {
          ...reply.toObject(),
          firstName: user?.firstName,
          lastName: user?.lastName,
          headline: user?.headline,
          profilePicture: user?.profilePicture,
          isLiked: {
            like: isLiked,
            type : impressionMap[comment._id.toString()]?.type || null,
          }
        };
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalReplies / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Replies retrieved successfully",
      replies: repliesWithUserInfo,
      pagination: {
        totalReplies,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error getting comment replies:", error);
    res.status(500).json({
      message: "Failed to get replies",
      error: error.message,
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { impressionType = "like" } = req.body; // Default to 'like' if not specified

    // Validate input
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Validate impression type
    const validImpressionTypes = [
      "like",
      "support",
      "celebrate",
      "love",
      "insightful",
      "funny",
    ];
    if (!validImpressionTypes.includes(impressionType)) {
      return res.status(400).json({
        message: "Invalid impression type",
        validTypes: validImpressionTypes,
      });
    }

    // Check if comment exists and is active
    const comment = await commentModel.findOne({
      _id: commentId,
      isActive: true,
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or inactive" });
    }

    // Check if user has already impressed this comment
    const existingImpression = await impressionModel.findOne({
      targetId: commentId,
      userId: userId,
      targetType: "Comment",
    });

    if (existingImpression) {
      // If the user already has an active impression on this comment
      if (existingImpression.type === impressionType) {
        return res.status(400).json({
          message: `You have already ${impressionType}d this comment`,
        });
      } else {
        // Store the old type before updating
        const oldType = existingImpression.type;

        // If they're changing their impression type, update it
        existingImpression.type = impressionType;
        await existingImpression.save();

        // Initialize impression counts if needed
        const impressionCounts = comment.impressionCounts || {};

        // Calculate new counts
        const oldTypeCount = Math.max(0, (impressionCounts[oldType] || 1) - 1);
        const newTypeCount = (impressionCounts[impressionType] || 0) + 1;

        // Use findByIdAndUpdate with specific field updates to avoid validation issues
        const updatedComment = await commentModel.findByIdAndUpdate(
          commentId,
          {
            [`impressionCounts.${oldType}`]: oldTypeCount,
            [`impressionCounts.${impressionType}`]: newTypeCount,
          },
          { new: true }
        );

        await notificationModel.findOneAndDelete({
          resourceId: existingImpression._id,
        });

        const sendingUser = await userModel.findById(userId);
        const recievingUser = await userModel.findById(updatedComment.userId);
        await sendNotification(
          sendingUser,
          recievingUser,
          "impression",
          existingImpression
        );

        return res.status(200).json({
          message: `Impression changed from ${oldType} to ${impressionType}`,
          impressionCounts: updatedComment.impressionCounts,
        });
      }
    }

    // Create new impression
    const newImpression = await impressionModel.create({
      targetId: commentId,
      targetType: "Comment",
      userId,
      type: impressionType,
      isActive: true,
    });

    // Initialize impression counts if needed
    const impressionCounts = comment.impressionCounts || {};
    const typeCount = (impressionCounts[impressionType] || 0) + 1;
    const totalCount = (impressionCounts.total || 0) + 1;

    // Add to impressions array if not already tracking
    let impressions = comment.impressions || [];
    if (!impressions.includes(newImpression._id)) {
      impressions.push(newImpression._id);
    }

    // Use findByIdAndUpdate with specific field updates to avoid validation issues
    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      {
        [`impressionCounts.${impressionType}`]: typeCount,
        "impressionCounts.total": totalCount,
        impressions: impressions,
      },
      { new: true }
    );
    const sendingUser = await userModel.findById(userId);
    const recievingUser = await userModel.findById(updatedComment.userId);
    await sendNotification(
      sendingUser,
      recievingUser,
      "impression",
      newImpression
    );
    res.status(200).json({
      message: `Comment ${impressionType}d successfully`,
      impressionCounts: updatedComment.impressionCounts,
    });
  } catch (error) {
    console.error(
      `Error ${req.body.impressionType || "like"}ing comment:`,
      error
    );
    res.status(500).json({
      message: `Failed to ${req.body.impressionType || "like"} comment`,
      error: error.message,
    });
  }
};

const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Validate input
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Check if comment exists and is active
    const comment = await commentModel.findOne({
      _id: commentId,
      isActive: true,
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or inactive" });
    }

    // Check if user has an active impression on this comment
    const existingImpression = await impressionModel.findOne({
      targetId: commentId,
      userId,
      targetType: "Comment",
    });

    if (!existingImpression) {
      return res
        .status(400)
        .json({ message: "You have not reacted to this comment" });
    }

    // Get the impression type before deleting
    const impressionType = existingImpression.type;

    await notificationModel.findOneAndDelete({
      resourceId: existingImpression._id,
    });

    // Hard delete the impression
    await impressionModel.findByIdAndDelete(existingImpression._id);

    // Initialize impression counts if needed
    const impressionCounts = comment.impressionCounts || {};
    const typeCount = Math.max(0, (impressionCounts[impressionType] || 0) - 1);
    const totalCount = Math.max(0, (impressionCounts.total || 0) - 1);

    // Remove from impressions array
    let impressions = comment.impressions || [];
    impressions = impressions.filter(
      (id) => id.toString() !== existingImpression._id.toString()
    );

    // Use findByIdAndUpdate with specific field updates to avoid validation issues
    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      {
        [`impressionCounts.${impressionType}`]: typeCount,
        "impressionCounts.total": totalCount,
        impressions: impressions,
      },
      { new: true }
    );

    res.status(200).json({
      message: `Comment ${impressionType} removed successfully`,
      impressionCounts: updatedComment.impressionCounts,
    });
  } catch (error) {
    console.error("Error removing comment impression:", error);
    res.status(500).json({
      message: "Failed to remove comment impression",
      error: error.message,
    });
  }
};

const getCommentImpressions = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    // Validate input
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Check if comment exists and is active
    const comment = await commentModel.findOne({
      _id: commentId,
      isActive: true,
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or inactive" });
    }

    // Build query for impressions
    const query = {
      targetId: commentId,
      targetType: "Comment",
    };

    // Add type filter if provided
    if (type) {
      const validImpressionTypes = [
        "like",
        "support",
        "celebrate",
        "love",
        "insightful",
        "funny",
      ];
      if (!validImpressionTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid impression type",
          validTypes: validImpressionTypes,
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
    const impressions = await impressionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limitNum);

    // Get user details for each impression
    const userIds = impressions.map((impression) => impression.userId);
    const users = await userModel.find(
      { _id: { $in: userIds } },
      "firstName lastName headline profilePicture"
    );

    // Create a map of user details for quick lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        firstName: user.firstName,
        lastName: user.lastName,
        headline: user.headline || "",
        profilePicture: user.profilePicture,
      };
    });

    // Combine impression data with user details
    const impressionsWithUserInfo = impressions.map((impression) => {
      const user = userMap[impression.userId.toString()] || {};
      return {
        impressionId: impression._id,
        userId: impression.userId,
        type: impression.type,
        createdAt: impression.createdAt,
        ...user,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalImpressions / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Get counts for each impression type
    const impressionCounts = comment.impressionCounts || {};

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
        total: impressionCounts.total || 0,
      },
      pagination: {
        totalImpressions,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error getting comment impressions:", error);
    res.status(500).json({
      message: "Failed to get impressions",
      error: error.message,
    });
  }
};
module.exports = {
  addComment,
  updateComment,
  getComment,
  getPostComments,
  deleteComment,
  getCommentReplies,
  likeComment,
  unlikeComment,
  getCommentImpressions,
};
