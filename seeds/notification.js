const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel');
const { notificationIds } = require('./init'); // Only import notification IDs from init

const notifications = [];

// Create content templates for different notification types
const contentTemplates = {
  impression: [
    "liked your post",
    "reacted with support to your post",
    "celebrated your post",
    "found your post insightful",
    "loved your post",
    "found your post funny"
  ],
  comment: [
    "commented on your post",
    "replied to your comment",
    "mentioned you in a comment",
    "tagged you in a comment"
  ],
  "connection request": [
    "sent you a connection request",
    "wants to connect with you",
    "would like to add you to their professional network"
  ],
  message: [
    "sent you a message",
    "shared a document with you",
    "sent you a voice message",
    "shared a contact with you"
  ],
  follow: [
    "started following you",
    "is now following your updates",
    "subscribed to your posts"
  ],
  post: [
    "shared a new post that might interest you",
    "mentioned you in a post",
    "tagged you in a post",
    "reposted your content"
  ]
};

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
      // Randomly select notification subject (type)
      const subject = faker.helpers.arrayElement([
        "impression", "comment", "connection request", "message", "follow", "post"
      ]);
      
      let from, to, relatedPostId, relatedCommentId, resourceId;
      
      // Different logic based on notification type
      switch (subject) {
        case "impression":
        case "post":
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
            
            resourceId = relatedPostId;
          } else {
            // If no real posts exist, just use random users
            from = faker.helpers.arrayElement(users)._id;
            
            // Get a different user for recipient
            do {
              to = faker.helpers.arrayElement(users)._id;
            } while (to.toString() === from.toString());
            
            resourceId = new mongoose.Types.ObjectId(); // Generate a placeholder ID
          }
          break;
          
        case "comment":
          if (comments.length && posts.length) {
            // Use real comment data if available
            const randomComment = faker.helpers.arrayElement(comments);
            relatedCommentId = randomComment._id;
            relatedPostId = randomComment.postId;
            
            // Find the post
            const relatedPost = posts.find(post => 
              post._id.toString() === relatedPostId.toString()
            );
            
            if (relatedPost) {
              // Find users by their IDs
              const commentAuthor = users.find(user => 
                user._id.toString() === randomComment.userId.toString()
              );
              
              const postOwner = users.find(user => 
                user._id.toString() === relatedPost.userId.toString()
              );
              
              // Use found users or fallback to random ones
              from = commentAuthor ? commentAuthor._id : faker.helpers.arrayElement(users)._id;
              to = postOwner ? postOwner._id : faker.helpers.arrayElement(users)._id;
              
              // Ensure from and to are different
              if (from.toString() === to.toString()) {
                const otherUsers = users.filter(user => 
                  user._id.toString() !== to.toString()
                );
                if (otherUsers.length) {
                  from = faker.helpers.arrayElement(otherUsers)._id;
                }
              }
            } else {
              // Fallback if the post isn't found
              from = faker.helpers.arrayElement(users)._id;
              do {
                to = faker.helpers.arrayElement(users)._id;
              } while (to.toString() === from.toString());
            }
            
            resourceId = relatedCommentId;
          } else {
            // Fallback if no comments or posts exist
            from = faker.helpers.arrayElement(users)._id;
            do {
              to = faker.helpers.arrayElement(users)._id;
            } while (to.toString() === from.toString());
            
            // Generate placeholder IDs
            relatedPostId = new mongoose.Types.ObjectId();
            relatedCommentId = new mongoose.Types.ObjectId();
            resourceId = relatedCommentId;
          }
          break;
          
        case "connection request":
        case "message":
        case "follow":
          // Simple user-to-user notifications
          from = faker.helpers.arrayElement(users)._id;
          
          // Find a different user to be the recipient
          do {
            to = faker.helpers.arrayElement(users)._id;
          } while (to.toString() === from.toString());
          
          resourceId = from; // The sender is the resource
          break;
      }
      
      // Select appropriate content template based on subject
      const contentTemplate = faker.helpers.arrayElement(contentTemplates[subject]);
      
      // Generate the notification
      notifications.push({
        _id: notifIds[i],
        from,
        to,
        subject,
        content: contentTemplate,
        resourceId,
        relatedPostId: (subject === "impression" || subject === "comment" || subject === "post") && relatedPostId 
          ? relatedPostId 
          : undefined,
        relatedCommentId: subject === "comment" && relatedCommentId ? relatedCommentId : undefined,
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
    const connectionNotifs = notifications.filter(n => n.subject === "connection request").length;
    const messageNotifs = notifications.filter(n => n.subject === "message").length;
    const followNotifs = notifications.filter(n => n.subject === "follow").length;
    const postNotifs = notifications.filter(n => n.subject === "post").length;
    const readNotifs = notifications.filter(n => n.isRead).length;
    
    console.log('Notification statistics:', {
      impression: impressionNotifs,
      comment: commentNotifs,
      connectionRequest: connectionNotifs,
      message: messageNotifs,
      follow: followNotifs,
      post: postNotifs,
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