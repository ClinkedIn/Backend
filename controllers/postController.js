const postModel = require('../models/postModel');

const dummyData = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

module.exports = {
    dummyData,
};