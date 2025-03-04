const { faker } = require('@faker-js/faker');
const ChatMessageModel = require('../models/chatMessageModel');
const DirectChatModel = require('../models/directChatModel');
const ChatGroupModel = require('../models/chatGroupModel');
const { userIds, messageIds, directChatIds, chatGroupIds } = require('./init');

const messages = [];

async function createRandomMessages() {
    // Handle Direct Chat Messages
    for (const chatId of directChatIds) {
        const chat = await DirectChatModel.findById(chatId);
        const participants = [chat.firstUser, chat.secondUser];
        
        // Generate 5-20 messages per chat
        const messageCount = faker.number.int({ min: 5, max: 20 });
        
        for (let i = 0; i < messageCount; i++) {
            const messageId = messageIds.pop(); // Get and remove next message ID
            if (!messageId) continue; // Skip if we're out of IDs

            const sender = faker.helpers.arrayElement(participants);
            
            messages.push({
                _id: messageId,
                sender: sender,
                chatId: chatId,
                type: 'direct',
                messageText: faker.lorem.sentence(),
                messageAttachment: faker.datatype.boolean() ? faker.image.url() : null,
                readBy: [sender], // Initially only read by sender
                timeStamp: faker.date.recent({ days: 30 }),
                isDeleted: faker.datatype.boolean({ probability: 0.1 }),
                replyTo: messages.length > 0 && faker.datatype.boolean({ probability: 0.3 }) 
                    ? faker.helpers.arrayElement(messages)._id 
                    : null
            });
        }
    }

    for (const chatId of chatGroupIds) {
        try {
            const chat = await ChatGroupModel.findById(chatId);
            if (!chat || !chat.members || chat.members.length === 0) {
                console.log(`Skipping group chat ${chatId}: No chat or members found`);
                continue;
            }
            
            // Generate 10-30 messages per group
            const messageCount = faker.number.int({ min: 10, max: 30 });
            
            for (let i = 0; i < messageCount; i++) {
                const messageId = messageIds.pop();
                if (!messageId) {
                    console.log('Ran out of message IDs');
                    break;
                }
    
                const sender = faker.helpers.arrayElement(chat.members);
                const readByCount = faker.number.int({ min: 1, max: chat.members.length });
                
                messages.push({
                    _id: messageId,
                    sender: sender,
                    chatId: chatId,
                    type: 'group',
                    messageText: faker.lorem.sentence(),
                    messageAttachment: faker.datatype.boolean() ? faker.image.url() : null,
                    readBy: faker.helpers.arrayElements(chat.members, readByCount),
                    timeStamp: faker.date.recent({ days: 30 }),
                    isDeleted: faker.datatype.boolean({ probability: 0.1 }),
                    replyTo: messages.length > 0 && faker.datatype.boolean({ probability: 0.3 }) 
                        ? faker.helpers.arrayElement(messages)._id 
                        : null
                });
            }
        } catch (error) {
            console.error(`Error processing group chat ${chatId}:`, error.message);
            continue;
        }
    }
}

async function chatMessageSeeder() {
    try {
        await createRandomMessages();
        console.log(`Generated ${messages.length} messages`);

        // Clear existing messages
        const deleteResult = await ChatMessageModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} messages`);

        // Insert new messages
        const insertResult = await ChatMessageModel.insertMany(messages);
        console.log(`Inserted ${insertResult.length} messages`);

        // Group messages by chat
        const chatMessageMap = messages.reduce((acc, msg) => {
            if (!acc[msg.chatId]) {
                acc[msg.chatId] = [];
            }
            acc[msg.chatId].push(msg._id);
            return acc;
        }, {});

        // Update direct chats with their messages
        for (const chatId of directChatIds) {
            if (chatMessageMap[chatId]) {
                await DirectChatModel.findByIdAndUpdate(
                    chatId,
                    { $set: { messages: chatMessageMap[chatId] } }
                );
            }
        }

        // Update group chats with their messages
        for (const chatId of chatGroupIds) {
            if (chatMessageMap[chatId]) {
                await ChatGroupModel.findByIdAndUpdate(
                    chatId,
                    { $set: { messages: chatMessageMap[chatId] } }
                );
            }
        }

        // Verify updates
        const sampleDirectChat = await DirectChatModel.findById(directChatIds[0]);
        const sampleGroupChat = await ChatGroupModel.findById(chatGroupIds[0]);
        
        console.log('Verification:', {
            totalMessages: messages.length,
            sampleDirectChatMessages: sampleDirectChat?.messages?.length || 0,
            sampleGroupChatMessages: sampleGroupChat?.messages?.length || 0,
            totalDirectChats: directChatIds.length,
            totalGroupChats: chatGroupIds.length
        });

    } catch (error) {
        console.error('Error seeding messages:', error);
    }
}

module.exports = chatMessageSeeder;