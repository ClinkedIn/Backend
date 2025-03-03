const { faker } = require('@faker-js/faker');
const PostModel = require('../models/postModel');
const { postIds, userIds, impressionIds, repostIds } = require('./init');

const posts = [];
console.log(postIds)
function createRandomPosts() {
    for (let i = 0; i < postIds.length; i++) {
        const attachments = faker.datatype.boolean() // Randomly decide if there are attachments
            ? [faker.image.url()] // Single image or video URL
            : [];
        
        const userId = faker.helpers.arrayElement(userIds);    

        const taggedUsers = faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: userIds.length }));

        const impressions = faker.helpers.arrayElements(impressionIds, faker.number.int({ min: 0, max: impressionIds.length }));

        const reposts = faker.helpers.arrayElements(repostIds, faker.number.int({ min: 0, max: repostIds.length }));

        posts.push({
            _id: postIds[i],
            userId: userId,
            description: faker.lorem.paragraph(),
            attachments: attachments,
            taggedUsers: taggedUsers,
            impressions: impressions,
            comments: [],
            reposts: reposts,
            isActive: faker.datatype.boolean(),
            createdAt: faker.date.recent({ days: 450 })
        });
    }
}

async function postSeeder() {
    try {
        createRandomPosts();
        console.log("Posts Length: ");
        console.log(posts.lenght);
        const deleteResult = await PostModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} posts`);

        const insertResult = await PostModel.insertMany(posts);
        console.log(`Inserted ${insertResult.length} posts`);

        console.log('Sample post:', insertResult[0]);
    } catch (error) {
        console.error('Error seeding posts:', error);
    }
}

module.exports = postSeeder