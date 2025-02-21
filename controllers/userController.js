const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const repostModel = require('../models/repostModel');
const reportModel = require('../models/reportModel');

const dummyData = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


module.exports = {
    dummyData
};