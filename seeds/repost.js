const { faker } = require('@faker-js/faker');
const RepostModel = require('../models/repostModel');
const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');
const { userIds, postIds, repostIds } = require('./init');

const reposts = [];

function createRandomReposts() {
    for (let i = 0; i < repostIds.length; i++) {
        const userId = faker.helpers.arrayElement(userIds);
        const postId = faker.helpers.arrayElement(postIds);

        reposts.push({
            _id: repostIds[i],
            userId: userId,
            postId: postId,
            description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
            createdAt: faker.date.recent({ days: 100 })
        });
    }
}

async function repostSeeder() {
    try {
        createRandomReposts();
        console.log(`Generated ${reposts.length} reposts`);

        // Clear existing reposts
        const deleteResult = await RepostModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} reposts`);

        // Insert new reposts
        const insertResult = await RepostModel.insertMany(reposts);
        console.log(`Inserted ${insertResult.length} reposts`);

        // Create maps for efficient updates
        const userRepostMap = new Map();
        const postRepostMap = new Map();

        reposts.forEach(repost => {
            // Group reposts by user
            if (!userRepostMap.has(repost.userId)) {
                userRepostMap.set(repost.userId, []);
            }
            userRepostMap.get(repost.userId).push(repost._id);

            // Group reposts by post
            if (!postRepostMap.has(repost.postId)) {
                postRepostMap.set(repost.postId, []);
            }
            postRepostMap.get(repost.postId).push(repost._id);
        });

        // Update users with their reposts
        for (const [userId, userReposts] of userRepostMap) {
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { reposts: userReposts } }
            );
        }
        console.log('Updated users with reposts');

        // Update posts with their reposts
        for (const [postId, postReposts] of postRepostMap) {
            await PostModel.findByIdAndUpdate(
                postId,
                { $set: { reposts: postReposts } }
            );
        }
        console.log('Updated posts with reposts');

        // Verify updates
        const sampleRepost = reposts[0];
        const sampleUser = await UserModel.findById(sampleRepost.userId);
        const samplePost = await PostModel.findById(sampleRepost.postId);

        console.log('Verification:', {
            userRepostCount: sampleUser.reposts.length,
            postRepostCount: samplePost.reposts.length
        });

    } catch (error) {
        console.error('Error seeding reposts:', error);
    }
}

module.exports = repostSeeder;