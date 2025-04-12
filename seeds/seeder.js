const { faker } = require('@faker-js/faker')

const process = require('process');
require('dotenv').config();
const connectDB = require('../models/db');

const userSeeder = require('./user');
const postSeeder = require('./post');
const commentSeeder = require('./comment');
const chatGroupSeeder = require('./chatGroup');
const directChatSeeder = require('./directChat');
const chatMessageSeeder = require('./chatMessage');
const companySeeder = require('./company');
const impressionSeeder = require('./impression');
const jobSeeder = require('./job');
const reportSeeder = require('./report');
const repostSeeder = require('./repost');
const subscriptionSeeder = require('./subscription');
const transactionSeeder = require('./transaction');
const notificationSeeder = require('./notification');
const { createRandomIds } = require('./init');

(async () => {
    try {
        await connectDB(); // Ensure DB connection first
        console.log('✅ Connected to MongoDB');


        //await createRandomIds();
        // Run seeders
        // await userSeeder();
        // await postSeeder();
        // await commentSeeder();
        // await repostSeeder();
        // await chatGroupSeeder();
        // await directChatSeeder();
        // await chatMessageSeeder();
        // await impressionSeeder();
        // await companySeeder();
        // await jobSeeder();
        // await reportSeeder();
        await notificationSeeder();
        // await otherSeeder();

        console.log('✅ Seeding completed successfully!');
        process.exit(0); // Exit the process cleanly
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1); // Exit with error code
    }
})();