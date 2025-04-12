const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel');
const { notificationIds } = require('./init'); // Only import notification IDs from init

const notifications = [];

// Define templates matching those in utils/Notification.js
const contentTemplates = {
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
  mention: (firstName, lastName) => 
    `${firstName} ${lastName} mentioned you in a comment`,
  tag: (firstName, lastName) => 
    `${firstName} ${lastName} tagged you in a post`,
  repost: (firstName, lastName) => 
    `${firstName} ${lastName} shared your post`,
  share: (firstName, lastName) => 
    `${firstName} ${lastName} shared a post`,
  post: (firstName, lastName) => 
    `${firstName} ${lastName} created a new post`,
  "connection request": (firstName, lastName) => 
    `${firstName} ${lastName} sent you a connection request`,
  connectionAccepted: (firstName) => 
    `${firstName} accepted your connection request`,
  connectionRejected: (firstName, lastName) => 
    `${firstName} ${lastName} rejected your connection request`
};

// Impression types matching those used in the application
const impressionTypes = ["like", "celebrate", "support", "love", "insightful", "funny"];

// Generate new ObjectIds if needed
function generateIds(count) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(new mongoose.Types.ObjectId());
  }
  return ids;
}

async function createRandomNotifications() {
  try {
    // Get real users, posts, and comments from the database
    const users = await UserModel.find({}, '_id firstName lastName');
    const posts = await PostModel.find({}, '_id userId');
    const comments = await CommentModel.find({}, '_id userId postId');
    
    if (!users.length) {
      console.log('No users found in database. You may need to seed users first.');
      return;
    }
    
    // Determine how many notifications to generate
    const count = notificationIds ? notificationIds.length : 100;
    
    // Use notificationIds from init.js if available, or generate new ones
    const notifIds = notificationIds || generateIds(count);
    
    console.log(`Using ${notificationIds ? 'predefined' : 'newly generated'} notification IDs`);
    console.log(`Found ${users.length} users, ${posts.length} posts, and ${comments.length} comments in the database`);
    
    for (let i = 0; i < notifIds.length; i++) {
      // Select a random subject (notification type)
      const subject = faker.helpers.arrayElement([
        "impression",
        "comment",
        "connection request",
        "message",
        "follow",
        "post",
      ]);
      
      let from, to, relatedPostId, relatedCommentId, resourceId;
      let content;
      
      // Different logic based on notification type
      switch (subject) {
        case "impression":
          // Determine if this is a post or comment impression
          const isPostImpression = posts.length > 0 && faker.datatype.boolean({ probability: 0.7 });
          
          if (isPostImpression && posts.length) {
            // Handle post impression
            const randomPost = faker.helpers.arrayElement(posts);
            relatedPostId = randomPost._id;
            
            // Find the post owner in users array
            const postOwner = users.find(user => 
              user._id.toString() === randomPost.userId.toString()
            );
            
            to = postOwner ? postOwner._id : faker.helpers.arrayElement(users)._id;
            
            // Find a different user to be the sender
            do {
              from = faker.helpers.arrayElement(users)._id;
            } while (from.toString() === to.toString());
            
            resourceId = new mongoose.Types.ObjectId(); // For impression ID
            
            // Get sender details for the content
            const fromUser = users.find(user => user._id.toString() === from.toString());
            const impressionType = faker.helpers.arrayElement(impressionTypes);
            
            // Use the correct template for post impressions
            content = contentTemplates.impression.Post(
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User',
              impressionType
            );
          } else if (comments.length) {
            // Handle comment impression
            const randomComment = faker.helpers.arrayElement(comments);
            relatedCommentId = randomComment._id;
            
            // Find the comment author
            const commentOwner = users.find(user => 
              user._id.toString() === randomComment.userId.toString()
            );
            
            to = commentOwner ? commentOwner._id : faker.helpers.arrayElement(users)._id;
            
            // Find a different user to be the sender
            do {
              from = faker.helpers.arrayElement(users)._id;
            } while (from.toString() === to.toString());
            
            resourceId = new mongoose.Types.ObjectId(); // For impression ID
            
            // Get the related post
            if (randomComment.postId) {
              relatedPostId = randomComment.postId;
            }
            
            // Get sender details for the content
            const fromUser = users.find(user => user._id.toString() === from.toString());
            const impressionType = faker.helpers.arrayElement(impressionTypes);
            
            // Use the correct template for comment impressions
            content = contentTemplates.impression.Comment(
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User',
              impressionType
            );
          } else {
            // Skip if no data available
            continue;
          }
          break;
          
        case "comment":
          if (posts.length) {
            // Use real post data if available
            const randomPost = faker.helpers.arrayElement(posts);
            relatedPostId = randomPost._id;
            
            // Find the post owner in users array
            const postOwner = users.find(user => 
              user._id.toString() === randomPost.userId.toString()
            );
            
            to = postOwner ? postOwner._id : faker.helpers.arrayElement(users)._id;
            
            // Find a different user to be the sender
            do {
              from = faker.helpers.arrayElement(users)._id;
            } while (from.toString() === to.toString());
            
            resourceId = new mongoose.Types.ObjectId(); // For comment ID
            
            // Get sender details for the content
            const fromUser = users.find(user => user._id.toString() === from.toString());
            
            // Use the correct template
            content = contentTemplates.comment(
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User'
            );
          } else {
            continue;
          }
          break;
          
        case "mention":
        case "tag":
          if (posts.length && users.length > 1) {
            // For mentions or tags
            const randomPost = faker.helpers.arrayElement(posts);
            relatedPostId = randomPost._id;
            
            // Get a random user as sender (not post owner)
            from = faker.helpers.arrayElement(users)._id;
            
            // Get a different user as recipient
            do {
              to = faker.helpers.arrayElement(users)._id;
            } while (to.toString() === from.toString());
            
            resourceId = relatedPostId; // The post is the resource
            
            // Get sender details for the content
            const fromUser = users.find(user => user._id.toString() === from.toString());
            
            // Use the correct template
            content = contentTemplates[subject](
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User'
            );
          } else {
            continue;
          }
          break;
          
        case "repost":
        case "share":
          if (posts.length) {
            // For reposts or shares
            const randomPost = faker.helpers.arrayElement(posts);
            relatedPostId = randomPost._id;
            
            // Find the post owner as recipient
            const postOwner = users.find(user => 
              user._id.toString() === randomPost.userId.toString()
            );
            
            to = postOwner ? postOwner._id : faker.helpers.arrayElement(users)._id;
            
            // Find a different user to be the sender
            do {
              from = faker.helpers.arrayElement(users)._id;
            } while (from.toString() === to.toString());
            
            resourceId = new mongoose.Types.ObjectId(); // For repost/share ID
            
            // Get sender details for the content
            const fromUser = users.find(user => user._id.toString() === from.toString());
            
            // Use the correct template
            content = contentTemplates[subject](
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User'
            );
          } else {
            continue;
          }
          break;
          
        case "post":
          // For new post notifications
          from = faker.helpers.arrayElement(users)._id;
          
          // Find a different user to be the recipient
          do {
            to = faker.helpers.arrayElement(users)._id;
          } while (to.toString() === from.toString());
          
          resourceId = new mongoose.Types.ObjectId(); // New post ID
          
          // Get sender details for the content
          const postCreator = users.find(user => user._id.toString() === from.toString());
          
          // Use the correct template
          content = contentTemplates.post(
            postCreator?.firstName || 'Unknown',
            postCreator?.lastName || 'User'
          );
          break;
          
        case "connection request":
        case "connectionAccepted":
        case "connectionRejected":
        case "follow":
        case "message":
          // Simple user-to-user notifications
          from = faker.helpers.arrayElement(users)._id;
          
          // Find a different user to be the recipient
          do {
            to = faker.helpers.arrayElement(users)._id;
          } while (to.toString() === from.toString());
          
          resourceId = from; // The sender is the resource
          
          // Get sender details for the content
          const fromUser = users.find(user => user._id.toString() === from.toString());
          
          if (subject === "connectionAccepted") {
            // Special case for connectionAccepted (only uses firstName)
            content = contentTemplates.connectionAccepted(
              fromUser?.firstName || 'Unknown'
            );
          } else {
            // Use the correct template for other types
            content = contentTemplates[subject](
              fromUser?.firstName || 'Unknown',
              fromUser?.lastName || 'User'
            );
          }
          break;
      }
      
      // Generate the notification
      notifications.push({
        _id: notifIds[i],
        from,
        to,
        subject,
        content,
        resourceId,
        relatedPostId: relatedPostId || undefined,
        relatedCommentId: relatedCommentId || undefined,
        isRead: faker.datatype.boolean({ probability: 0.3 }), // 30% chance of being read
        isDeleted: faker.datatype.boolean({ probability: 0.1 }), // 10% chance of being deleted
        createdAt: faker.date.recent({ days: 30 }) // Last 30 days
      });
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
    throw error;
  }
}

async function notificationSeeder() {
  try {
    // Generate random notifications
    await createRandomNotifications();
    
    if (notifications.length === 0) {
      console.log('No notifications were generated. Check database connectivity and if users exist.');
      return;
    }
    
    console.log(`Generated ${notifications.length} notifications`);

    // Clear existing notifications
    const deleteResult = await NotificationModel.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing notifications`);

    // Insert new notifications
    const insertResult = await NotificationModel.insertMany(notifications);
    console.log(`Successfully inserted ${insertResult.length} notifications`);
    
    // Get statistics on notification types
    const impressionNotifs = notifications.filter(n => n.subject === "impression").length;
    const commentNotifs = notifications.filter(n => n.subject === "comment").length;
    const connectionReqNotifs = notifications.filter(n => n.subject === "connection request").length;
    const connectionAcceptedNotifs = notifications.filter(n => n.subject === "connectionAccepted").length;
    const connectionRejectedNotifs = notifications.filter(n => n.subject === "connectionRejected").length;
    const messageNotifs = notifications.filter(n => n.subject === "message").length;
    const followNotifs = notifications.filter(n => n.subject === "follow").length;
    const postNotifs = notifications.filter(n => n.subject === "post").length;
    const repostNotifs = notifications.filter(n => n.subject === "repost").length;
    const mentionNotifs = notifications.filter(n => n.subject === "mention").length;
    const tagNotifs = notifications.filter(n => n.subject === "tag").length;
    const shareNotifs = notifications.filter(n => n.subject === "share").length;
    const readNotifs = notifications.filter(n => n.isRead).length;
    
    console.log('Notification statistics:', {
      impression: impressionNotifs,
      comment: commentNotifs,
      connectionRequest: connectionReqNotifs,
      connectionAccepted: connectionAcceptedNotifs,
      connectionRejected: connectionRejectedNotifs,
      message: messageNotifs,
      follow: followNotifs,
      post: postNotifs,
      repost: repostNotifs,
      mention: mentionNotifs,
      tag: tagNotifs,
      share: shareNotifs,
      read: readNotifs,
      unread: notifications.length - readNotifs
    });

    // Verify a sample notification
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
          createdAt: sampleNotification.createdAt
        });
      }
    }
  } catch (error) {
    console.error('Error seeding notifications:', error);
  }
}

module.exports = notificationSeeder;