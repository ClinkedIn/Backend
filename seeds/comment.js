const { faker } = require('@faker-js/faker');
const CommentModel = require('../models/commentModel');
const PostModel = require('../models/postModel');
const { postIds, userIds, impressionIds, commentIds } = require('./init');
const UserModel = require('../models/userModel');
const commentsSeed = [];

function createRandomComments() {
    const postCommentMap = new Map(postIds.map(id => [id, []])); // Track comments for each post

    for (let i = 0; i < commentIds.length; i++) {
        const userId = faker.helpers.arrayElement(userIds);
        const postId = faker.helpers.arrayElement(postIds); 
        const impressions = faker.helpers.arrayElements(impressionIds, faker.number.int({ min: 0, max: 10 }));

        // 50% chance of being a reply to an existing comment on the same post
        const possibleParentComments = postCommentMap.get(postId);
        const parentComment = faker.datatype.boolean() && possibleParentComments.length > 0
            ? faker.helpers.arrayElement(possibleParentComments)._id
            : null;

        const comment = {
            _id: commentIds[i],
            userId,
            postId,
            commentContent: faker.lorem.sentence(),
            commentAttachment: faker.datatype.boolean() ? faker.image.url() : null,
            impressions,
            replies: [],
            parentComment,
            isActive: faker.datatype.boolean(),
            createdAt: faker.date.recent({ days: 450 }),
        };

        commentsSeed.push(comment);
        postCommentMap.get(postId).push(comment._id); // Track comment under its post
    }

    // Ensure each comment correctly links its replies
    const commentMap = new Map(commentsSeed.map(comment => [comment._id, comment]));

    for (const comment of commentsSeed) {
        if (comment.parentComment) {
            const parent = commentMap.get(comment.parentComment);
            if (parent) {
                parent.replies.push(comment._id);
            }
        }
    }

    return postCommentMap;
}

async function commentSeeder() {
    try {
        const postCommentMap = createRandomComments();
        
        // Create a map for user comments
        const userCommentMap = new Map();
        commentsSeed.forEach(comment => {
            if (!userCommentMap.has(comment.userId)) {
                userCommentMap.set(comment.userId, []);
            }
            userCommentMap.get(comment.userId).push(comment._id);
        });

        await CommentModel.deleteMany({});
        console.log(`Deleted existing comments`);

        await CommentModel.insertMany(commentsSeed);
        console.log(`Inserted ${commentsSeed.length} comments`);

        // Update posts with their comments
        for (const [postId, comments] of postCommentMap) {
            await PostModel.findByIdAndUpdate(
                postId, 
                { $set: { comments: comments } }
            );
        }        
        console.log('Updated posts with comments');

        // Update users with their comments
        for (const [userId, comments] of userCommentMap) {
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { comments: comments } }
            );
        }
        console.log('Updated users with comments');

        // Verify updates
        const sampleComment = commentsSeed[0];
        const sampleUser = await UserModel.findById(sampleComment.userId);
        const samplePost = await PostModel.findById(sampleComment.postId);
        
        console.log('Verification:', {
            userCommentCount: sampleUser.comments.length,
            postCommentCount: samplePost.comments.length
        });

    } catch (error) {
        console.error('Error seeding comments:', error);
    }
}

module.exports = commentSeeder;
