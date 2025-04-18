const companyModel = require('../models/companyModel');
const userModel = require('../models/userModel');
const {
    uploadFile,
    uploadMultipleImages,
    deleteFileFromUrl,
} = require('../utils/cloudinaryUpload');
const APIFeatures = require('../utils/apiFeatures');
const slugify = require('slugify');
// Create a new company
const createCompany = async (req, res) => {
    try {
        const { name, address, industry, organizationSize, organizationType } =
            req.body;
        if (
            !name ||
            !address ||
            !industry ||
            !organizationSize ||
            !organizationType
        ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const organizationSizeEnum =
            companyModel.schema.path('organizationSize').enumValues;
        const organizationTypeEnum =
            companyModel.schema.path('organizationType').enumValues;

        if (!organizationSizeEnum.includes(organizationSize)) {
            return res.status(400).json({
                message: `Invalid organization size. Valid options are: ${organizationSizeEnum.join(
                    ', '
                )}`,
            });
        }
        if (!organizationTypeEnum.includes(organizationType)) {
            return res.status(400).json({
                message: `Invalid organization type. Valid options are: ${organizationTypeEnum.join(
                    ', '
                )}`,
            });
        }
        const cleanAddress = slugify(address, { lower: true, strict: true });

        const existingCompany = await companyModel.findOne({
            address: cleanAddress,
        });
        if (existingCompany) {
            return res.status(400).json({
                message: 'Company with this address already exists',
            });
        }

        let logo = null;
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res
                    .status(400)
                    .json({ message: 'Please upload an image file' });
            }
            try {
                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.mimetype
                );
                logo = uploadResult.url;
            } catch (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({
                    message: 'Failed to upload image',
                });
            }
        }

        const protocol = req.protocol;
        const host = req.get('host'); // e.g., yourdomain.com
        const pageURL = `${protocol}://${host}/companies/${cleanAddress}`;

        const admins = [req.user.id]; // Add the creator as an admin
        const newCompany = new companyModel({
            ownerId: req.user.id,
            admins,
            name,
            address: cleanAddress,
            industry,
            organizationSize,
            organizationType,
            logo,
        });
        await newCompany.save();
        // Add the company to the creator's list of companies

        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { companies: newCompany._id },
        });
        res.status(201).json({
            ...newCompany.toObject(),
            pageURL, // Include full URL in response
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ message: 'Internal server error ' });
    }
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const features = new APIFeatures(
            companyModel.find({ isDeleted: false }),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const companies = await features.query;
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific company by ID
const getCompany = async (req, res) => {
    try {
        console.log('Company ID:', req.params.companyId);
        let company = null;

        if (req.params.companyId) {
            const slug = slugify(req.params.companyId, {
                lower: true,
                strict: true,
            });
            console.log('Slug:', slug);
            company = await companyModel.findOne({
                address: slug,
            });

            if (!company) {
                company = await companyModel.findById(req.params.companyId);
            }
        }
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Internal server error' });
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
        company.organizationSize =
            req.body.organizationSize || company.organizationSize;
        company.organizationType =
            req.body.organizationType || company.organizationType;
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
            return res
                .status(400)
                .json({ message: 'User ID is required to follow the company' });
        }
        // Check if the user is already following
        if (company.followers.includes(userId)) {
            return res
                .status(400)
                .json({ message: 'User is already following this company' });
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
            return res.status(400).json({
                message: 'User ID is required to unfollow the company',
            });
        }
        company.followers = company.followers.filter(
            (id) => id.toString() !== userId
        );
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
            return res
                .status(400)
                .json({ message: 'User ID is required to add a visitor' });
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
    addVisitor,
};
