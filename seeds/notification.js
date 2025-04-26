const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel');
const ImpressionModel = require('../models/impressionModel');
const MessageModel = require('../models/chatMessageModel');

// Clear array for notifications
const notifications = [];

// Target user ID
const TARGET_USER_ID = '4c5dee21eac8c6fdcf5e3dc7';

// Notification templates based on utils/Notification.js
const notificationTemplates = {
  impression: {
    Post: (firstName, lastName, type) => 
      `${firstName} ${lastName} reacted with ${type} to your post`,
    Comment: (firstName, lastName, type) => 
      `${firstName} ${lastName} reacted with ${type} to your comment`
  },
  comment: (firstName, lastName) => 
    `${firstName} ${lastName} commented on your post`,
  follow: (firstName, lastName) => 
    `${firstName} ${lastName} started following you`,
  message: (firstName, lastName) => 
    `${firstName} ${lastName} sent you a message`,
  post: (firstName, lastName) => 
    `${firstName} ${lastName} created a new post`
};

// Valid impression types
const impressionTypes = ["like", "celebrate", "support", "love", "insightful", "funny"];

/**
 * Generate notification IDs
 */
function generateIds(count) {
  return Array(count).fill().map(() => new mongoose.Types.ObjectId());
}

/**
 * Seed notifications for the specified user
 */
async function notificationSeeder() {
  try {
    console.log('Starting notification seeder...');
    
    // 1. DELETE ALL EXISTING NOTIFICATIONS
    const deleteAllResult = await NotificationModel.deleteMany({});
    console.log(`Deleted ALL existing notifications: ${deleteAllResult.deletedCount}`);
    
    // 2. GET THE TARGET USER
    const targetUser = await UserModel.findById(TARGET_USER_ID);
    if (!targetUser) {
      console.log(`Target user with ID ${TARGET_USER_ID} not found. Please check the ID and try again.`);
      return;
    }
    console.log(`Found target user: ${targetUser.firstName} ${targetUser.lastName}`);
    
    // 3. GET OTHER USERS FOR INTERACTIONS
    const otherUsers = await UserModel.find({ _id: { $ne: TARGET_USER_ID } }).limit(20);
    if (!otherUsers.length) {
      console.log('No other users found in database to create interactions.');
      return;
    }
    console.log(`Found ${otherUsers.length} other users for interactions`);
    
    // 4. FETCH REAL DATA FROM THE DATABASE
    
    // Get posts by the target user
    const userPosts = await PostModel.find({ 
      userId: TARGET_USER_ID,
      isActive: true 
    }).limit(20).populate('userId', 'firstName lastName');
    
    console.log(`Found ${userPosts.length} posts by target user`);
    
    // Get comments by the target user
    const userComments = await CommentModel.find({
      userId: TARGET_USER_ID
    }).limit(20).populate('userId', 'firstName lastName');
    
    console.log(`Found ${userComments.length} comments by target user`);
    
    // Get comments on the target user's posts
    const commentsOnUserPosts = await CommentModel.find({
      postId: { $in: userPosts.map(p => p._id) }
    }).limit(30).populate('userId', 'firstName lastName');
    
    console.log(`Found ${commentsOnUserPosts.length} comments on target user's posts`);
    
    // Get impressions on target user's content
    const impressionsOnUserPosts = await ImpressionModel.find({
      targetId: { $in: userPosts.map(p => p._id) }, 
      targetType: 'Post',
      isActive: true
    }).limit(30).populate('userId', 'firstName lastName');
    
    console.log(`Found ${impressionsOnUserPosts.length} impressions on target user's posts`);
    
    // Get impressions on target user's comments
    const impressionsOnUserComments = await ImpressionModel.find({
      targetId: { $in: userComments.map(c => c._id) }, 
      targetType: 'Comment',
      isActive: true
    }).limit(20).populate('userId', 'firstName lastName');
    
    console.log(`Found ${impressionsOnUserComments.length} impressions on target user's comments`);
    
    // Get messages sent to the target user
    const messagesReceivedByUser = await MessageModel.find({
      receiver: TARGET_USER_ID
    }).limit(20).populate('sender', 'firstName lastName');
    
    console.log(`Found ${messagesReceivedByUser.length} messages received by target user`);
    
    // 5. DETERMINE NOTIFICATION DISTRIBUTION
    const notificationCount = 50;
    const notificationIds = generateIds(notificationCount);
    let idIndex = 0;
    
    // Distribution percentages for notification types
    const distribution = {
      impression: 0.4,  // 40% impressions (high priority)
      comment: 0.3,     // 30% comments
      message: 0.15,    // 15% messages
      follow: 0.1,      // 10% follows
      post: 0.05        // 5% posts
    };
    
    // Calculate counts for each type
    const counts = {
      impression: Math.floor(notificationCount * distribution.impression),
      comment: Math.floor(notificationCount * distribution.comment),
      message: Math.floor(notificationCount * distribution.message),
      follow: Math.floor(notificationCount * distribution.follow),
      post: Math.floor(notificationCount * distribution.post)
    };
    
    // Adjust to ensure total equals notificationCount
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    if (sum < notificationCount) {
      counts.impression += (notificationCount - sum);
    }
    
    // Track generated notifications
    const stats = { total: 0 };
    for (const type in counts) {
      stats[type] = 0;
    }
    
    console.log(`Generating ${notificationCount} notifications with distribution:`, counts);
    
    // 6. GENERATE IMPRESSION NOTIFICATIONS (on user's posts and comments)
    
    // Combine real impressions
    const allImpressions = [
      ...impressionsOnUserPosts.map(imp => ({ ...imp.toObject(), targetType: 'Post' })),
      ...impressionsOnUserComments.map(imp => ({ ...imp.toObject(), targetType: 'Comment' }))
    ];
    
    // Sort by recent first to use the newest impressions
    allImpressions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    // Use real impressions as much as possible
    const impressionCount = Math.min(counts.impression, allImpressions.length);
    
    for (let i = 0; i < impressionCount; i++) {
      const impression = allImpressions[i];
      
      // Skip if critical data is missing
      if (!impression || !impression.userId || !impression.targetId) continue;
      
      // Get the user who made the impression
      let impressor;
      if (typeof impression.userId === 'object' && impression.userId.firstName) {
        impressor = impression.userId;
      } else {
        impressor = otherUsers.find(u => u._id.toString() === impression.userId.toString());
      }
      
      if (!impressor) continue;
      
      let relatedPostId, relatedCommentId;
      
      // Set related content IDs
      if (impression.targetType === 'Post') {
        relatedPostId = impression.targetId;
      } else {
        relatedCommentId = impression.targetId;
        
        // Find the comment to get its post ID
        const comment = userComments.find(c => c._id.toString() === relatedCommentId.toString());
        if (comment && comment.postId) {
          relatedPostId = comment.postId;
        }
      }
      
      // Use the correct template for post or comment impression
      const content = impression.targetType === 'Post'
        ? notificationTemplates.impression.Post(impressor.firstName, impressor.lastName, impression.type || 'like')
        : notificationTemplates.impression.Comment(impressor.firstName, impressor.lastName, impression.type || 'like');
      
      // Create notification
      notifications.push({
        _id: notificationIds[idIndex++],
        from: impression.userId._id || impression.userId,
        to: mongoose.Types.ObjectId(TARGET_USER_ID),
        subject: 'impression',
        content,
        resourceId: impression._id,
        relatedPostId,
        relatedCommentId,
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }),
        createdAt: impression.createdAt || faker.date.recent({ days: 30 })
      });
      
      stats.impression++;
      stats.total++;
    }
    
    // Create synthetic impressions if we need more
    const remainingImpressions = counts.impression - stats.impression;
    
    if (remainingImpressions > 0) {
      console.log(`Creating ${remainingImpressions} synthetic impression notifications`);
      
      for (let i = 0; i < remainingImpressions; i++) {
        const impressor = faker.helpers.arrayElement(otherUsers);
        const impressionType = faker.helpers.arrayElement(impressionTypes);
        
        // Decide if this is a post or comment impression
        let targetType, relatedPostId, relatedCommentId, content;
        
        if ((userPosts.length > 0) && (i % 3 !== 0 || userComments.length === 0)) {
          // 2/3 of synthetic impressions on posts (if posts exist)
          targetType = 'Post';
          const randomPost = faker.helpers.arrayElement(userPosts);
          relatedPostId = randomPost._id;
          
          content = notificationTemplates.impression.Post(
            impressor.firstName, 
            impressor.lastName, 
            impressionType
          );
        } else if (userComments.length > 0) {
          // 1/3 of synthetic impressions on comments (if comments exist)
          targetType = 'Comment';
          const randomComment = faker.helpers.arrayElement(userComments);
          relatedCommentId = randomComment._id;
          relatedPostId = randomComment.postId;
          
          content = notificationTemplates.impression.Comment(
            impressor.firstName, 
            impressor.lastName, 
            impressionType
          );
        } else if (userPosts.length > 0) {
          // Fallback to posts if no comments exist
          targetType = 'Post';
          const randomPost = faker.helpers.arrayElement(userPosts);
          relatedPostId = randomPost._id;
          
          content = notificationTemplates.impression.Post(
            impressor.firstName, 
            impressor.lastName, 
            impressionType
          );
        } else {
          // Skip if no valid content to impress on
          continue;
        }
        
        // Create notification
        notifications.push({
          _id: notificationIds[idIndex++],
          from: new mongoose.Types.ObjectId(impressor._id),
          to: new mongoose.Types.ObjectId(TARGET_USER_ID),
          subject: 'impression',
          content,
          resourceId: new mongoose.Types.ObjectId(), // Synthetic impression ID
          relatedPostId,
          relatedCommentId,
          isRead: faker.datatype.boolean({ probability: 0.3 }),
          isDeleted: faker.datatype.boolean({ probability: 0.1 }),
          createdAt: faker.date.recent({ days: 30 })
        });
        
        stats.impression++;
        stats.total++;
      }
    }
    
    // 7. GENERATE COMMENT NOTIFICATIONS
    
    // Use real comments on the user's posts
    const commentCount = Math.min(counts.comment, commentsOnUserPosts.length);
    
    for (let i = 0; i < commentCount; i++) {
      const comment = commentsOnUserPosts[i];
      
      // Skip if critical data is missing
      if (!comment || !comment.userId || !comment.postId) continue;
      
      // Get the commenter
      let commenter;
      if (typeof comment.userId === 'object' && comment.userId.firstName) {
        commenter = comment.userId;
      } else {
        commenter = otherUsers.find(u => u._id.toString() === comment.userId.toString());
      }
      
      if (!commenter) continue;
      
      // Create notification
      notifications.push({
        _id: notificationIds[idIndex++],
        from: new mongoose.Types.ObjectId(comment.userId._id) || new mongoose.Types.ObjectId(comment.userId),
        to: new mongoose.Types.ObjectId(TARGET_USER_ID),
        subject: 'comment',
        content: notificationTemplates.comment(commenter.firstName, commenter.lastName),
        resourceId: comment._id,
        relatedPostId: comment.postId,
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }),
        createdAt: comment.createdAt || faker.date.recent({ days: 30 })
      });
      
      stats.comment++;
      stats.total++;
    }
    
    // Create synthetic comments if we need more
    const remainingComments = counts.comment - stats.comment;
    
    if (remainingComments > 0 && userPosts.length > 0) {
      console.log(`Creating ${remainingComments} synthetic comment notifications`);
      
      for (let i = 0; i < remainingComments; i++) {
        const commenter = faker.helpers.arrayElement(otherUsers);
        const randomPost = faker.helpers.arrayElement(userPosts);
        
        // Create notification
        notifications.push({
          _id: notificationIds[idIndex++],
          from: new mongoose.Types.ObjectId(commenter._id),
          to: new mongoose.Types.ObjectId(TARGET_USER_ID),
          subject: 'comment',
          content: notificationTemplates.comment(commenter.firstName, commenter.lastName),
          resourceId: new mongoose.Types.ObjectId(), // Synthetic comment ID
          relatedPostId: randomPost._id,
          isRead: faker.datatype.boolean({ probability: 0.3 }),
          isDeleted: faker.datatype.boolean({ probability: 0.1 }),
          createdAt: faker.date.recent({ days: 30 })
        });
        
        stats.comment++;
        stats.total++;
      }
    }
    
    // 8. GENERATE MESSAGE NOTIFICATIONS
    
    // Use real messages sent to the user
    const messageCount = Math.min(counts.message, messagesReceivedByUser.length);
    
    for (let i = 0; i < messageCount; i++) {
      const message = messagesReceivedByUser[i];
      
      // Skip if critical data is missing
      if (!message || !message.sender) continue;
      
      // Get the sender
      let sender;
      if (typeof message.sender === 'object' && message.sender.firstName) {
        sender = message.sender;
      } else {
        sender = otherUsers.find(u => u._id.toString() === message.sender.toString());
      }
      
      if (!sender) continue;
      
      // Create notification
      notifications.push({
        _id: notificationIds[idIndex++],
        from: new mongoose.Types.ObjectId(message.sender._id) || new mongoose.Types.ObjectId(message.sender),
        to: new mongoose.Types.ObjectId(TARGET_USER_ID),
        subject: 'message',
        content: notificationTemplates.message(sender.firstName, sender.lastName),
        resourceId: message._id,
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }),
        createdAt: message.createdAt || faker.date.recent({ days: 30 })
      });
      
      stats.message++;
      stats.total++;
    }
    
    // Create synthetic messages if we need more
    const remainingMessages = counts.message - stats.message;
    
    if (remainingMessages > 0) {
      console.log(`Creating ${remainingMessages} synthetic message notifications`);
      
      for (let i = 0; i < remainingMessages; i++) {
        const sender = faker.helpers.arrayElement(otherUsers);
        
        // Create notification
        notifications.push({
          _id: notificationIds[idIndex++],
          from: new mongoose.Types.ObjectId(sender._id),
          to: new mongoose.Types.ObjectId(TARGET_USER_ID),
          subject: 'message',
          content: notificationTemplates.message(sender.firstName, sender.lastName),
          resourceId: new mongoose.Types.ObjectId(), // Synthetic message ID
          isRead: faker.datatype.boolean({ probability: 0.3 }),
          isDeleted: faker.datatype.boolean({ probability: 0.1 }),
          createdAt: faker.date.recent({ days: 30 })
        });
        
        stats.message++;
        stats.total++;
      }
    }
    
    // 9. GENERATE FOLLOW NOTIFICATIONS
    
    // Create synthetic follow notifications
    for (let i = 0; i < counts.follow; i++) {
      const follower = faker.helpers.arrayElement(otherUsers);
      
      // Create notification
      notifications.push({
        _id: notificationIds[idIndex++],
        from: new mongoose.Types.ObjectId(follower._id),
        to: new mongoose.Types.ObjectId(TARGET_USER_ID),
        subject: 'follow',
        content: notificationTemplates.follow(follower.firstName, follower.lastName),
        resourceId: follower._id, // The follower is the resource
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }),
        createdAt: faker.date.recent({ days: 30 })
      });
      
      stats.follow++;
      stats.total++;
    }
    
    // 10. GENERATE POST NOTIFICATIONS
    
    // Create synthetic post notifications
    for (let i = 0; i < counts.post; i++) {
      const poster = faker.helpers.arrayElement(otherUsers);
      
      // Create notification
      notifications.push({
        _id: notificationIds[idIndex++],
        from: new mongoose.Types.ObjectId(poster._id),
        to: new mongoose.Types.ObjectId(TARGET_USER_ID),
        subject: 'post',
        content: notificationTemplates.post(poster.firstName, poster.lastName),
        resourceId: new mongoose.Types.ObjectId(), // Synthetic post ID
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }),
        createdAt: faker.date.recent({ days: 30 })
      });
      
      stats.post++;
      stats.total++;
    }
    
    // 11. SAVE NOTIFICATIONS TO DATABASE
    
    if (notifications.length === 0) {
      console.log('No notifications were generated. Check if the target user has any content.');
      return;
    }
    
    // Sort notifications by date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);
    
    const insertResult = await NotificationModel.insertMany(notifications);
    console.log(`Successfully inserted ${insertResult.length} notifications`);
    
    // 12. PRINT STATISTICS
    
    console.log('Notification statistics:', {
      total: stats.total,
      impression: stats.impression,
      comment: stats.comment,
      message: stats.message,
      follow: stats.follow,
      post: stats.post
    });
    
    // Display a sample notification
    if (notifications.length > 0) {
      const sampleNotification = await NotificationModel.findById(notifications[0]._id)
        .populate('from', 'firstName lastName')
        .populate('to', 'firstName lastName');
        
      if (sampleNotification) {
        console.log('Sample notification:', {
          id: sampleNotification._id,
          from: `${sampleNotification.from?.firstName || 'Unknown'} ${sampleNotification.from?.lastName || 'User'}`,
          to: `${sampleNotification.to?.firstName || 'Unknown'} ${sampleNotification.to?.lastName || 'User'}`,
          subject: sampleNotification.subject,
          content: sampleNotification.content,
          resourceId: sampleNotification.resourceId,
          relatedPostId: sampleNotification.relatedPostId,
          relatedCommentId: sampleNotification.relatedCommentId,
          createdAt: sampleNotification.createdAt
        });
      }
    }
    
    console.log('Notification seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding notifications:', error);
  }
}

module.exports = notificationSeeder;