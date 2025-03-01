// fuctions implementation is a placeholder
const companyModel = require('../models/companyModel');

// Create a new company
const createCompany = async (req, res) => {
    try {
        const company = new companyModel({
            userId: req.body.userId,
            name: req.body.name,
            address: req.body.address,
            website: req.body.website,
            industry: req.body.industry,
            organizationSize: req.body.organizationSize,
            organizationType: req.body.organizationType,
            logo: req.body.logo,
            tagLine: req.body.tagLine,
            followers: [],
            visitors: []
        });
        const newCompany = await company.save();
        res.status(201).json(newCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const companies = await companyModel.find();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific company by ID
const getCompany = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a company by ID
const updateCompany = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        company.userId = req.body.userId || company.userId;
        company.name = req.body.name || company.name;
        company.address = req.body.address || company.address;
        company.website = req.body.website || company.website;
        company.industry = req.body.industry || company.industry;
        company.organizationSize = req.body.organizationSize || company.organizationSize;
        company.organizationType = req.body.organizationType || company.organizationType;
        company.logo = req.body.logo || company.logo;
        company.tagLine = req.body.tagLine || company.tagLine;
        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a company by ID
const deleteCompany = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        await company.remove();
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Follow a company
const followCompany = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to follow the company' });
        }
        // Check if the user is already following
        if (company.followers.includes(userId)) {
            return res.status(400).json({ message: 'User is already following this company' });
        }
        company.followers.push(userId);
        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unfollow a company
const unfollowCompany = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to unfollow the company' });
        }
        company.followers = company.followers.filter(id => id.toString() !== userId);
        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a visitor to the company's visitors list
const addVisitor = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to add a visitor' });
        }
        if (!company.visitors.includes(userId)) {
            company.visitors.push(userId);
        }
        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCompany,
    getAllCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    followCompany,
    unfollowCompany,
    addVisitor
};
