const { faker } = require('@faker-js/faker');

const USERS_NUM = 100;
const POSTS_NUM = 100;
const COMMENTS_NUM = 100;
const REPORTS_NUM = 100;
const REPOSTS_NUM = 100;
const COMPANIES_NUM = 100;
const CHAT_GROUPS_NUM = 100;
const DIRECT_CHAT_NUM = 100;
const MESSAGES_NUM = 100;
const IMPRESSIONS_NUM = 100;
const NOTIFICATIONS_NUM = 100;
const SUBSCRIPTIONS_NUM = 100;
const TRANSACTIONS_NUM = 100;
const JOBS_NUM = 100;
const generateIds = (count) => Array.from({ length: count }, () => faker.database.mongodbObjectId());

let userIds = [];
let postIds = [];
let commentIds = [];
let reportIds = [];
let repostIds = [];
let companyIds = [];
let chatGroupIds = [];
let directChatIds = [];
let messageIds = [];
let impressionIds = [];
let notificationIds = [];
let subscriptionIds = [];
let transactionIds = [];
let jobIds= [];
userIds = generateIds(USERS_NUM);
postIds = generateIds(POSTS_NUM);
commentIds = generateIds(COMMENTS_NUM);
reportIds = generateIds(REPORTS_NUM);
repostIds = generateIds(REPOSTS_NUM);
companyIds = generateIds(COMPANIES_NUM);
chatGroupIds = generateIds(CHAT_GROUPS_NUM);
directChatIds = generateIds(DIRECT_CHAT_NUM);
messageIds = generateIds(MESSAGES_NUM);
impressionIds = generateIds(IMPRESSIONS_NUM);
notificationIds = generateIds(NOTIFICATIONS_NUM);
subscriptionIds = generateIds(SUBSCRIPTIONS_NUM);
transactionIds = generateIds(TRANSACTIONS_NUM);
jobIds = generateIds(JOBS_NUM);
module.exports = {
    userIds,
    postIds,
    commentIds,
    reportIds,
    repostIds,
    companyIds,
    chatGroupIds,
    directChatIds,
    messageIds,
    impressionIds,
    notificationIds,
    subscriptionIds,
    transactionIds,
    jobIds
};
