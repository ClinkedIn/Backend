const impressionModel = require('../models/impressiontModel');


const createImpression = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const getAllImpressionsByTargetId = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

const deleteImpressionById = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

module.exports = {
    createImpression,
    getAllImpressionsByTargetId,
    deleteImpressionById
};