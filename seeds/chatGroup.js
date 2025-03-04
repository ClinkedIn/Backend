const { faker } = require('@faker-js/faker');
const ChatGroupModel = require('../models/chatGroupModel');
const UserModel = require('../models/userModel');
const { userIds, chatGroupIds } = require('./init');

const chatGroups = [];

function createRandomChatGroups() {
    for (let i = 0; i < chatGroupIds.length; i++) {
        // Get random members (2-8 users per group)
        const members = faker.helpers.arrayElements(
            userIds,
            faker.number.int({ min: 2, max: 8 })
        );

        chatGroups.push({
            _id: chatGroupIds[i],
            name: faker.company.name(),
            members: members,
            messages: [], // Messages will be added by message seeder
            isActive: true,
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: faker.date.recent()
        });
    }
}

async function chatGroupSeeder() {
    try {
        createRandomChatGroups();
        console.log(`Generated ${chatGroups.length} chat groups`);

        // Clear existing chat groups
        const deleteResult = await ChatGroupModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} chat groups`);

        // Insert new chat groups
        const insertResult = await ChatGroupModel.insertMany(chatGroups);
        console.log(`Inserted ${insertResult.length} chat groups`);

        // Create map for efficient user updates
        const userChatMap = new Map();

        // Group chats by user
        chatGroups.forEach(group => {
            group.members.forEach(userId => {
                if (!userChatMap.has(userId)) {
                    userChatMap.set(userId, []);
                }
                userChatMap.get(userId).push({
                    chatId: group._id,
                    chatType: 'ChatGroup',
                    unreadCount: 0,
                    lastReadAt: faker.date.recent()
                });
            });
        });

        // Update users with their chat groups
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
        console.log('Updated users with chat groups');

        // Verify updates
        const sampleGroup = chatGroups[0];
        const sampleUser = await UserModel.findById(sampleGroup.members[0]);
        
        console.log('Verification:', {
            groupMemberCount: sampleGroup.members.length,
            userChatCount: sampleUser.chats.length
        });

    } catch (error) {
        console.error('Error seeding chat groups:', error);
    }
}

module.exports = chatGroupSeeder;