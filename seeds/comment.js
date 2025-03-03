const { faker } = require('@faker-js/faker');
const CommentModel = require('../models/commentModel');
const PostModel = require('../models/postModel');
const { postIds, userIds, impressionIds, commentIds } = require('./init');

const commentsSeed = [];

function createRandomComments() {
    const postCommentMap = new Map(postIds.map(id => [id, []])); // Track comments for each post

    for (let i = 0; i < commentIds.length; i++) {
        const userId = faker.helpers.arrayElement(userIds);
        const postId = faker.helpers.arrayElement(postIds); 
        const taggedUsers = faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 5 }));
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
            taggedUsers,
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

        await CommentModel.deleteMany({});
        console.log(`Deleted existing comments`);

        await CommentModel.insertMany(commentsSeed);
        console.log(`Inserted ${commentsSeed.length} comments`);

        for (const [postId, comments] of postCommentMap) {
            await PostModel.findByIdAndUpdate(postId, { $push: { comments: { $each: comments } } });
        }        
        console.log('Updated posts with comments');

    } catch (error) {
        console.error('Error seeding comments:', error);
    }
}

module.exports = commentSeeder;
