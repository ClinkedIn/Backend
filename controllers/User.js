const userModel = require('../models/User');
const postModel = require('../models/Post');
const commentModel = require('../models/Comment');
const repostModel = require('../models/Repost');
const reportModel = require('../models/Report');

const dummyData = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


module.exports = {
    dummyData
};