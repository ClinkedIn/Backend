const { faker } = require('@faker-js/faker');
const DirectChatModel = require('../models/directChatModel');
const UserModel = require('../models/userModel');
const { userIds, directChatIds } = require('./init');

const directChats = [];
const processedPairs = new Set(); // Track unique user pairs
function createRandomDirectChats() {


    for (let i = 0; i < directChatIds.length; i++) {
        // Get two different random users
        let firstUser, secondUser;
        let pairKey;

        do {
            firstUser = faker.helpers.arrayElement(userIds);
            secondUser = faker.helpers.arrayElement(
                userIds.filter(id => id !== firstUser)
            );
            // Create a consistent key for the pair (sort to ensure uniqueness)
            pairKey = [firstUser, secondUser].sort().join('-');
        } while (processedPairs.has(pairKey));

        processedPairs.add(pairKey);

        directChats.push({
            _id: directChatIds[i],
            firstUser: firstUser,
            secondUser: secondUser,
            messages: [], // Messages will be added by message seeder
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: faker.date.recent()
        });
    }
}

async function directChatSeeder() {
    try {
        createRandomDirectChats();
        console.log(`Generated ${directChats.length} direct chats`);

        // Clear existing direct chats
        const deleteResult = await DirectChatModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} direct chats`);

        // Insert new direct chats
        const insertResult = await DirectChatModel.insertMany(directChats);
        console.log(`Inserted ${insertResult.length} direct chats`);

        // Create map for efficient user updates
        const userChatMap = new Map();

        // Group direct chats by user
        directChats.forEach(chat => {
            [chat.firstUser, chat.secondUser].forEach(userId => {
                if (!userChatMap.has(userId)) {
                    userChatMap.set(userId, []);
                }
                userChatMap.get(userId).push({
                    chatId: chat._id,
                    chatType: 'DirectChat',
                    unreadCount: 0,
                    lastReadAt: faker.date.recent()
                });
            });
        });

        // Update users with their direct chats
        for (const [userId, chats] of userChatMap) {
            await UserModel.findByIdAndUpdate(
                userId,
                { 
                    $push: { 
                        chats: { 
                            $each: chats 
                        }
                    }
                }
            );
        }
        console.log('Updated users with direct chats');

        // Verify updates
        const sampleChat = directChats[0];
        const sampleUser = await UserModel.findById(sampleChat.firstUser);
        
        console.log('Verification:', {
            directChatCount: directChats.length,
            userChatCount: sampleUser.chats.length,
            uniquePairs: processedPairs.size
        });

    } catch (error) {
        console.error('Error seeding direct chats:', error);
    }
}

module.exports = directChatSeeder;