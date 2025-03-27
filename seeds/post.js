const { faker } = require('@faker-js/faker');
const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel'); 
const { postIds, userIds, impressionIds, repostIds } = require('./init');

const posts = [];
console.log(postIds)
function createRandomPosts() {
    for (let i = 0; i < postIds.length; i++) {
        const attachments = faker.datatype.boolean() // Randomly decide if there are attachments
            ? [faker.image.url()] // Single image or video URL
            : [];
        
        const userId = faker.helpers.arrayElement(userIds);    


        const impressions = faker.helpers.arrayElements(impressionIds, faker.number.int({ min: 0, max: impressionIds.length }));

        const reposts = faker.helpers.arrayElements(repostIds, faker.number.int({ min: 0, max: repostIds.length }));

        posts.push({
            _id: postIds[i],
            userId: userId,
            description: faker.lorem.paragraph(),
            attachments: attachments,
            impressions: impressions,
            comments: [],
            reposts: reposts,
            isActive: true,
            createdAt: faker.date.recent({ days: 450 })
        });
    }
}

async function postSeeder() {
    try {
        createRandomPosts();
        console.log("Posts Length: ", posts.length); // Fixed typo in 'length'

        const deleteResult = await PostModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} posts`);

        const insertResult = await PostModel.insertMany(posts);
        console.log(`Inserted ${insertResult.length} posts`);

        // Update users with their posts
        const userPostMap = posts.reduce((acc, post) => {
            if (!acc[post.userId]) {
                acc[post.userId] = [];
            }
            acc[post.userId].push(post._id);
            return acc;
        }, {});

        // Update each user with their posts
        for (const [userId, userPosts] of Object.entries(userPostMap)) {
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { posts: userPosts } },
                { new: true }
            );
        }
        console.log('Updated users with their posts');

        // Verify a sample user's posts
        const sampleUserId = posts[0].userId;
        const sampleUser = await UserModel.findById(sampleUserId);
        console.log(`Sample user (${sampleUserId}) has ${sampleUser.posts.length} posts`);

    } catch (error) {
        console.error('Error seeding posts:', error);
    }
}

module.exports = postSeeder