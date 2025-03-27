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
            isActive: true, // All reposts are active by default
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

        // Reset repostCount on all posts to ensure accurate counts
        await PostModel.updateMany({}, { $set: { repostCount: 0 } });
        console.log('Reset repost counts to zero on all posts');

        // Create maps for efficient updates
        const userRepostMap = new Map();
        const postRepostMap = new Map();
        const postRepostCountMap = new Map();

        reposts.forEach(repost => {
            // Only consider active reposts
            if (repost.isActive) {
                // Group reposts by user
                if (!userRepostMap.has(repost.userId)) {
                    userRepostMap.set(repost.userId, []);
                }
                userRepostMap.get(repost.userId).push(repost._id);

                // Group reposts by post
                if (!postRepostMap.has(repost.postId)) {
                    postRepostMap.set(repost.postId, []);
                    postRepostCountMap.set(repost.postId, 0);
                }
                postRepostMap.get(repost.postId).push(repost._id);
                postRepostCountMap.set(repost.postId, postRepostCountMap.get(repost.postId) + 1);
            }
        });

        // Update users with their reposts
        for (const [userId, userReposts] of userRepostMap) {
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { reposts: userReposts } }
            );
        }
        console.log('Updated users with reposts');

        // Update posts with their reposts and repost counts
        const postUpdatePromises = [];
        for (const [postId, postReposts] of postRepostMap) {
            const repostCount = postRepostCountMap.get(postId);
            postUpdatePromises.push(
                PostModel.findByIdAndUpdate(
                    postId,
                    { 
                        $set: { 
                            reposts: postReposts,
                            repostCount: repostCount
                        } 
                    }
                )
            );
        }
        await Promise.all(postUpdatePromises);
        console.log('Updated posts with reposts and repost counts');

        // Verify updates for a few random posts
        const sampleSize = Math.min(5, postRepostMap.size);
        const samplePostIds = [...postRepostMap.keys()].slice(0, sampleSize);
        
        console.log('\nVerification of repost counts:');
        for (const postId of samplePostIds) {
            const post = await PostModel.findById(postId);
            const actualRepostCount = await RepostModel.countDocuments({ 
                postId, 
                isActive: true 
            });
            
            console.log(`Post ${postId}: repostCount = ${post.repostCount}, actual active reposts = ${actualRepostCount}, reposts array length = ${post.reposts.length}`);
            console.log(`Match: ${post.repostCount === actualRepostCount ? '✓ YES' : '✗ NO'}`);
        }

        // Final verification of total counts
        const totalActiveReposts = await RepostModel.countDocuments({ isActive: true });
        const sumOfRepostCounts = await PostModel.aggregate([
            { $group: { _id: null, total: { $sum: "$repostCount" } } }
        ]);
        
        const totalRepostCount = sumOfRepostCounts.length > 0 ? sumOfRepostCounts[0].total : 0;
        
        console.log('\nGlobal verification:');
        console.log(`Total active reposts in database: ${totalActiveReposts}`);
        console.log(`Sum of all repostCount fields: ${totalRepostCount}`);
        console.log(`Match: ${totalRepostCount === totalActiveReposts ? '✓ YES' : '✗ NO'}`);

    } catch (error) {
        console.error('Error seeding reposts:', error);
    }
}

module.exports = repostSeeder;