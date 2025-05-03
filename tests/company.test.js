const companyController = require('../controllers/companyController');
const companyModel = require('../models/companyModel');
const userModel = require('../models/userModel');
const { uploadFile } = require('../utils/cloudinaryUpload');
const slugify = require('slugify');

// controllers/companyController.test.js

// Mock dependencies
jest.mock('../models/companyModel');
jest.mock('../models/userModel');
jest.mock('../utils/cloudinaryUpload');
jest.mock('slugify');

describe('Company Controller - createCompany', () => {
    let req;
    let res;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock request and response objects
        req = {
            body: {
                name: 'Test Company',
                address: 'test-company',
                industry: 'Technology',
                organizationSize: '11-50',
                organizationType: 'Private',
                website: 'https://testcompany.com',
                tagLine: 'Testing is our business',
                location: 'New York',
            },
            user: { id: 'user123' },
            protocol: 'https',
            get: jest.fn().mockReturnValue('testdomain.com'),
            file: null,
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Setup default mocks
        companyModel.schema = {
            path: jest.fn().mockReturnValue({
                enumValues: [
                    '1-10',
                    '11-50',
                    '51-200',
                    '201-500',
                    '501-1000',
                    '1001-5000',
                    '5000+',
                ],
            }),
        };

        companyModel.schema.path.mockImplementation((path) => {
            if (path === 'organizationSize') {
                return {
                    enumValues: [
                        '1-10',
                        '11-50',
                        '51-200',
                        '201-500',
                        '501-1000',
                        '1001-5000',
                        '5000+',
                    ],
                };
            }
            if (path === 'organizationType') {
                return {
                    enumValues: [
                        'Public',
                        'Private',
                        'Nonprofit',
                        'Government',
                        'Educational',
                        'Self-employed',
                    ],
                };
            }
            return { enumValues: [] };
        });

        // Default slugify implementation
        slugify.mockImplementation((str) =>
            str.toLowerCase().replace(/\s+/g, '-')
        );

        // Mock for success return
        companyModel.findOne.mockResolvedValue(null);

        // Mock companyModel constructor and save
        companyModel.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(true),
            _id: 'company123',
            name: req.body.name,
            address: slugify(req.body.address),
            industry: req.body.industry,
            organizationSize: req.body.organizationSize,
            organizationType: req.body.organizationType,
            website: req.body.website,
            tagLine: req.body.tagLine,
            location: req.body.location,
            logo: null,
            ownerId: req.user.id,
            admins: [req.user.id],
            followers: [],
            following: [],
            visitors: [],
            posts: [],
        }));

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: req.user.id,
            companies: ['company123'],
        });
    });

    test('should create a company successfully with all fields', async () => {
        // Arrange is handled in beforeEach

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(companyModel.findOne).toHaveBeenCalledWith({
            address: 'test-company',
        });
        expect(companyModel).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test Company',
                address: 'test-company',
                industry: 'Technology',
                organizationSize: '11-50',
                organizationType: 'Private',
                website: 'https://testcompany.com',
                tagLine: 'Testing is our business',
                location: 'New York',
                logo: null,
                admins: ['user123'],
                ownerId: 'user123',
            })
        );

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
            $push: { companies: expect.any(String) },
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pageURL: 'https://testdomain.com/companies/test-company',
                message: 'Company created successfully',
            })
        );
    });

    test('should return 400 if required fields are missing', async () => {
        // Arrange
        req.body = {
            name: 'Test Company',
            // Missing address
            industry: 'Technology',
            // Missing organizationSize
            organizationType: 'Private',
        };

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'All fields are required',
        });
        expect(companyModel).not.toHaveBeenCalled();
    });

    test('should return 400 if organization size is invalid', async () => {
        // Arrange
        req.body.organizationSize = 'Invalid Size';

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Invalid organization size'),
            })
        );
    });

    test('should return 400 if organization type is invalid', async () => {
        // Arrange
        req.body.organizationType = 'Invalid Type';

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Invalid organization type'),
            })
        );
    });

    test('should return 400 if company with address already exists', async () => {
        // Arrange
        companyModel.findOne.mockResolvedValueOnce({
            _id: 'existingCompany123',
            address: 'test-company',
        });

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Company with this address already exists',
        });
    });

    test('should handle logo upload if file is provided', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test image content'),
            mimetype: 'image/png',
        };
        uploadFile.mockResolvedValueOnce({
            url: 'http://cloudinary.com/image.png',
        });

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(uploadFile).toHaveBeenCalledWith(
            req.file.buffer,
            req.file.mimetype
        );
        expect(companyModel).toHaveBeenCalledWith(
            expect.objectContaining({
                logo: 'http://cloudinary.com/image.png',
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if uploaded file is not an image', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test document content'),
            mimetype: 'application/pdf',
        };

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(uploadFile).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Please upload an image file',
        });
    });

    test('should return 500 if image upload fails', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test image content'),
            mimetype: 'image/png',
        };
        uploadFile.mockRejectedValueOnce(new Error('Upload failed'));

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(uploadFile).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Failed to upload image',
        });
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        // Act
        await companyController.createCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error ',
        });
    });
});

describe('Company Controller - updateCompany', () => {
    let req;
    let res;
    let mockCompany;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Original Company',
            address: 'original-company',
            industry: 'Technology',
            organizationSize: '11-50',
            organizationType: 'Private',
            website: 'https://originalcompany.com',
            tagLine: 'Original tagline',
            location: 'New York',
            logo: 'http://example.com/original-logo.jpg',
            ownerId: { toString: () => 'owner123' },
            admins: [
                { toString: () => 'owner123' },
                { toString: () => 'admin456' },
            ],
            followers: [],
            following: [],
            visitors: [],
            posts: [],
            save: jest.fn().mockResolvedValue(true),
            toString: () => 'company123',
        };

        // Set up request object with update data
        req = {
            params: {
                companyId: 'company123',
            },
            user: { id: 'owner123' },
            body: {
                name: 'Updated Company',
                address: 'updated-company',
                website: 'https://updatedcompany.com',
                industry: 'Software',
                organizationSize: '51-200',
                organizationType: 'Public',
                tagLine: 'Updated tagline',
                location: 'San Francisco',
            },
            protocol: 'https',
            get: jest.fn().mockReturnValue('testdomain.com'),
            file: null,
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Set up schema path mocks for validation
        companyModel.schema = {
            path: jest.fn().mockImplementation((path) => {
                if (path === 'organizationSize') {
                    return {
                        enumValues: [
                            '1-10',
                            '11-50',
                            '51-200',
                            '201-500',
                            '501-1000',
                            '1001-5000',
                            '5000+',
                        ],
                    };
                }
                if (path === 'organizationType') {
                    return {
                        enumValues: [
                            'Public',
                            'Private',
                            'Nonprofit',
                            'Government',
                            'Educational',
                            'Self-employed',
                        ],
                    };
                }
                return { enumValues: [] };
            }),
        };

        // Configure mock implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        companyModel.findOne.mockResolvedValue(null); // No conflict by default
        companyModel.findByIdAndUpdate.mockImplementation(
            (id, data, options) => {
                return Promise.resolve({
                    ...mockCompany,
                    ...data,
                    _id: id,
                });
            }
        );

        // Mock slugify to return lowercase with hyphens
        slugify.mockImplementation((str) =>
            str.toLowerCase().replace(/\s+/g, '-')
        );
    });

    test('should update a company successfully with all fields', async () => {
        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(companyModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'company123',
            expect.objectContaining({
                name: 'Updated Company',
                address: 'updated-company',
                website: 'https://updatedcompany.com',
                industry: 'Software',
                organizationSize: '51-200',
                organizationType: 'Public',
                tagLine: 'Updated tagline',
                location: 'San Francisco',
            }),
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pageURL: 'https://testdomain.com/companies/updated-company',
            })
        );
    });

    test('should update a company with only some fields provided', async () => {
        // Arrange
        req.body = {
            name: 'Partially Updated Company',
            industry: 'Finance',
        };

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(companyModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'company123',
            expect.objectContaining({
                name: 'Partially Updated Company',
                industry: 'Finance',
            }),
            { new: true, runValidators: true }
        );
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalledWith(
            'company123',
            expect.objectContaining({
                address: expect.anything(),
                website: expect.anything(),
                organizationSize: expect.anything(),
                organizationType: expect.anything(),
            }),
            expect.anything()
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 if company is not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });

    test('should return 403 if user is not authorized to update', async () => {
        // Arrange
        req.user.id = 'unauthorized123'; // User is neither owner nor admin

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Not authorized to update this company',
        });
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should allow admin to update company', async () => {
        // Arrange
        req.user.id = 'admin456'; // User is an admin but not owner

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(companyModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    test('should return 400 if organization size is invalid', async () => {
        // Arrange
        req.body.organizationSize = 'Invalid Size';

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Invalid organization size'),
            })
        );
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 if organization type is invalid', async () => {
        // Arrange
        req.body.organizationType = 'Invalid Type';

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Invalid organization type'),
            })
        );
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 if company with address already exists', async () => {
        // Arrange
        companyModel.findOne.mockResolvedValueOnce({
            _id: 'existingCompany456',
            address: 'updated-company',
        });

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(companyModel.findOne).toHaveBeenCalledWith({
            address: 'updated-company',
            _id: { $ne: 'company123' }, // Should exclude current company
        });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Company with this address already exists',
        });
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 if uploaded file is not an image', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test document content'),
            mimetype: 'application/pdf',
        };

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Please upload an image file',
        });
        expect(uploadFile).not.toHaveBeenCalled();
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should handle logo upload if file is provided', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test image content'),
            mimetype: 'image/png',
        };
        uploadFile.mockResolvedValueOnce({
            url: 'http://cloudinary.com/new-image.png',
        });

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(uploadFile).toHaveBeenCalledWith(
            req.file.buffer,
            req.file.mimetype
        );
        expect(companyModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'company123',
            expect.objectContaining({
                logo: 'http://cloudinary.com/new-image.png',
            }),
            expect.anything()
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 500 if image upload fails', async () => {
        // Arrange
        req.file = {
            buffer: Buffer.from('test image content'),
            mimetype: 'image/png',
        };
        uploadFile.mockRejectedValueOnce(new Error('Upload failed'));

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(uploadFile).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Failed to upload image',
        });
        expect(companyModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.updateCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - deleteCompany', () => {
    let req;
    let res;
    let mockCompany;
    let mockUser;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            address: 'test-company',
            ownerId: { toString: () => 'owner123' },
            admins: [
                { toString: () => 'owner123' },
                { toString: () => 'admin456' },
            ],
            isDeleted: false,
            save: jest.fn().mockResolvedValue(true),
        };

        // Mock user data
        mockUser = {
            _id: 'owner123',
            companies: ['company123', 'otherCompany789'],
            save: jest.fn().mockResolvedValue(true),
        };

        // Set up request object
        req = {
            params: {
                companyId: 'company123',
            },
            user: { id: 'owner123' },
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Configure mock implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.findById.mockResolvedValue(mockUser);
    });

    test('should soft delete a company successfully as owner', async () => {
        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(mockCompany.isDeleted).toBe(true);
        expect(mockCompany.save).toHaveBeenCalled();
        expect(userModel.findById).toHaveBeenCalledWith('owner123');
        expect(mockUser.companies).toEqual(['otherCompany789']);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            data: null,
        });
    });

    test('should soft delete a company successfully as admin', async () => {
        // Arrange
        req.user.id = 'admin456';

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(mockCompany.isDeleted).toBe(true);
        expect(mockCompany.save).toHaveBeenCalled();
        expect(userModel.findById).toHaveBeenCalledWith('admin456');
        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should return 404 if company is not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
        expect(mockCompany.save).not.toHaveBeenCalled();
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    test('should return 403 if user is not authorized to delete', async () => {
        // Arrange
        req.user.id = 'unauthorized123'; // User is neither owner nor admin

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Not authorized to delete this company',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    test('should handle company with no matches in user companies array', async () => {
        // Arrange
        mockUser.companies = ['otherCompany789']; // No match for company123

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(mockCompany.isDeleted).toBe(true);
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.companies).toEqual(['otherCompany789']);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should handle user with empty companies array', async () => {
        // Arrange
        mockUser.companies = [];

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(mockCompany.isDeleted).toBe(true);
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.companies).toEqual([]);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.deleteCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Database error',
        });
    });
});

describe('Company Controller - getAllCompanies', () => {
    let req;
    let res;
    let mockCompanies;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock companies data
        mockCompanies = [
            {
                _id: 'company1',
                name: 'Company One',
                address: 'company-one',
                industry: 'Technology',
                organizationSize: '11-50',
                organizationType: 'Private',
                website: 'https://companyone.com',
                logo: 'http://example.com/logo1.jpg',
                ownerId: { toString: () => 'owner123' },
                admins: [{ toString: () => 'owner123' }],
                followers: [],
                following: [],
                visitors: [],
                posts: [],
            },
            {
                _id: 'company2',
                name: 'Company Two',
                address: 'company-two',
                industry: 'Healthcare',
                organizationSize: '51-200',
                organizationType: 'Public',
                website: 'https://companytwo.com',
                logo: 'http://example.com/logo2.jpg',
                ownerId: { toString: () => 'owner456' },
                admins: [{ toString: () => 'owner456' }],
                followers: [],
                following: [],
                visitors: [],
                posts: [],
            },
        ];

        // Set up request object
        req = {
            user: { id: 'user123' },
            query: {},
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock APIFeatures class methods
        const mockQuery = {
            query: mockCompanies,
        };

        APIFeatures = jest.fn().mockImplementation(() => ({
            filter: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limitFields: jest.fn().mockReturnThis(),
            paginate: jest.fn().mockReturnThis(),
            query: mockCompanies,
        }));
    });

    test('should handle internal server errors', async () => {
        // Arrange
        APIFeatures = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // Act
        await companyController.getAllCompanies(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - getCompany', () => {
    let req;
    let res;
    let mockCompany;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            address: 'test-company',
            industry: 'Technology',
            organizationSize: '11-50',
            organizationType: 'Private',
            website: 'https://testcompany.com',
            tagLine: 'Test tagline',
            location: 'New York',
            logo: 'http://example.com/logo.jpg',
            ownerId: { toString: () => 'owner123' },
            admins: [{ toString: () => 'owner123' }],
            followers: [],
            following: [],
            visitors: [],
            posts: [],
            save: jest.fn().mockResolvedValue(true),
        };

        // Setup request object
        req = {
            params: { companyId: 'test-company' },
            user: { id: 'visitor789' },
        };

        // Setup response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock find by ID and find by address
        companyModel.findById.mockResolvedValue(null);
        companyModel.findOne.mockResolvedValue(mockCompany);

        // Mock slugify to return lowercase with hyphens
        slugify.mockImplementation((str) =>
            str.toLowerCase().replace(/\s+/g, '-')
        );
    });

    test('should retrieve company by address', async () => {
        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(slugify).toHaveBeenCalledWith('test-company', {
            lower: true,
            strict: true,
        });
        expect(companyModel.findOne).toHaveBeenCalledWith({
            address: 'test-company',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                company: expect.objectContaining({
                    name: 'Test Company',
                    address: 'test-company',
                }),
            })
        );
    });

    test('should retrieve company by ID', async () => {
        // Arrange
        companyModel.findOne.mockResolvedValueOnce(null);
        companyModel.findById.mockResolvedValueOnce(mockCompany);

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(companyModel.findOne).toHaveBeenCalledWith({
            address: 'test-company',
        });
        expect(companyModel.findById).toHaveBeenCalledWith('test-company');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 if company is not found', async () => {
        // Arrange
        companyModel.findOne.mockResolvedValueOnce(null);
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });

    test('should add visitor to company when user is visitor', async () => {
        // Arrange - default setup has user as visitor
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(mockCompany.visitors).toContainEqual({
            id: 'visitor789',
            visitedAt: expect.any(Date),
        });
        expect(mockCompany.save).toHaveBeenCalled();
    });

    test('should not add duplicate visitor on same day', async () => {
        // Arrange
        const today = new Date();
        mockCompany.visitors = [
            {
                id: 'visitor789',
                visitedAt: today,
            },
        ];

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(mockCompany.visitors.length).toBe(1);
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should update visit date if last visit was before today', async () => {
        // Arrange
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockCompany.visitors = [
            {
                id: 'visitor789',
                visitedAt: yesterday,
            },
        ];

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(mockCompany.visitors[0].visitedAt).not.toEqual(yesterday);
        expect(mockCompany.save).toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findOne.mockRejectedValueOnce(new Error('Database error'));

        // Act
        await companyController.getCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - followCompany', () => {
    let req;
    let res;
    let mockCompany;
    let mockUser;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            address: 'test-company',
            followers: [],
            save: jest.fn().mockResolvedValue(true),
        };

        // Mock user data
        mockUser = {
            _id: 'user123',
            following: [],
            save: jest.fn().mockResolvedValue(true),
        };

        // Set up request object
        req = {
            params: { companyId: 'company123' },
            user: { id: 'user123' },
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock find implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.findById.mockResolvedValue(mockUser);
    });

    test('should follow company successfully', async () => {
        // Act
        await companyController.followCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(userModel.findById).toHaveBeenCalledWith('user123');
        expect(mockCompany.followers).toContainEqual({
            entity: 'user123',
            entityType: 'User',
            followedAt: expect.any(Number),
        });
        expect(mockUser.following).toContainEqual({
            entity: 'company123',
            entityType: 'Company',
            followedAt: expect.any(Number),
        });
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully followed the company',
        });
    });

    test('should return 404 if company not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.followCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
        // Arrange
        userModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.followCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 400 if already following company', async () => {
        // Arrange
        mockCompany.followers = [
            {
                entity: { toString: () => 'user123' },
                entityType: 'User',
                followedAt: Date.now(),
            },
        ];

        // Act
        await companyController.followCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'You are already following this company',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.followCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Interal server error',
        });
    });
});

describe('Company Controller - unfollowCompany', () => {
    let req;
    let res;
    let mockCompany;
    let mockUser;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data with a follower
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            address: 'test-company',
            followers: [
                {
                    entity: { toString: () => 'user123' },
                    entityType: 'User',
                    followedAt: Date.now(),
                },
            ],
            save: jest.fn().mockResolvedValue(true),
        };

        // Mock user data following the company
        mockUser = {
            _id: 'user123',
            following: [
                {
                    entity: { toString: () => 'company123' },
                    entityType: 'Company',
                    followedAt: Date.now(),
                },
            ],
            save: jest.fn().mockResolvedValue(true),
        };

        // Set up request object
        req = {
            params: { companyId: 'company123' },
            user: { id: 'user123' },
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock find implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.findById.mockResolvedValue(mockUser);
    });

    test('should unfollow company successfully', async () => {
        // Act
        await companyController.unfollowCompany(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(userModel.findById).toHaveBeenCalledWith('user123');
        expect(mockCompany.followers).toEqual([]);
        expect(mockUser.following).toEqual([]);
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully unfollowed the company',
        });
    });

    test('should return 404 if company not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.unfollowCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
        // Arrange
        userModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.unfollowCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 400 if not following company', async () => {
        // Arrange
        mockCompany.followers = [];

        // Act
        await companyController.unfollowCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'You are not following this company',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.unfollowCompany(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - addAdmin', () => {
    let req;
    let res;
    let mockCompany;
    let mockUser;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            ownerId: { toString: () => 'owner123' },
            admins: ['owner123'],
            save: jest.fn().mockResolvedValue(true),
        };

        // Mock user data
        mockUser = {
            _id: 'user456',
            companies: [],
            save: jest.fn().mockResolvedValue(true),
        };

        // Set up request object
        req = {
            params: { companyId: 'company123' },
            body: { userId: 'user456' },
            user: { id: 'owner123' }, // Request is made by the owner
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Configure mock implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.findById.mockResolvedValue(mockUser);
    });

    test('should add admin successfully', async () => {
        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(mockCompany.admins).toContain('user456');
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.companies).toContain('company123');
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User added as admin successfully',
            admins: expect.arrayContaining(['owner123', 'user456']),
        });
    });

    test('should return 400 if company ID is missing', async () => {
        // Arrange
        req.params.companyId = '';

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Company ID is required',
        });
    });

    test('should return 400 if user ID is missing', async () => {
        // Arrange
        req.body.userId = '';

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User ID is required',
        });
    });

    test('should return 404 if company not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });

    test('should return 403 if requester is not the owner', async () => {
        // Arrange
        req.user.id = 'nonowner789';

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Only the owner can add admins',
        });
    });

    test('should return 400 if user is already an admin', async () => {
        // Arrange
        mockCompany.admins = ['owner123', 'user456'];

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User is already an admin of this company',
        });
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.addAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - removeAdmin', () => {
    let req;
    let res;
    let mockCompany;
    let mockUser;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            ownerId: { toString: () => 'owner123' },
            admins: ['owner123', 'admin456', 'admin789'],
            save: jest.fn().mockResolvedValue(true),
        };

        // Mock user data
        mockUser = {
            _id: 'admin456',
            companies: ['company123', 'otherCompany789'],
            save: jest.fn().mockResolvedValue(true),
        };

        // Set up request object
        req = {
            params: { companyId: 'company123' },
            body: { userId: 'admin456' },
            user: { id: 'owner123' }, // Request made by the owner
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Configure mock implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.findById.mockResolvedValue(mockUser);
    });

    test('should remove an admin successfully', async () => {
        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(companyModel.findById).toHaveBeenCalledWith('company123');
        expect(mockCompany.admins).not.toContain('admin456');
        expect(mockCompany.save).toHaveBeenCalled();
        expect(mockUser.companies).not.toContain('company123');
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User removed as admin successfully',
            admins: expect.arrayContaining(['owner123', 'admin789']),
        });
    });

    test('should return 400 if company ID is missing', async () => {
        // Arrange
        req.params.companyId = '';

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Company ID is required',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 400 if user ID is missing', async () => {
        // Arrange
        req.body.userId = '';

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User ID is required',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 404 if company not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 403 if requester is not the owner', async () => {
        // Arrange
        req.user.id = 'nonowner789';

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Only the owner can remove admins',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should return 400 if user is not an admin', async () => {
        // Arrange
        mockCompany.admins = ['owner123', 'admin789']; // admin456 not in list

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User is not an admin of this company',
        });
        expect(mockCompany.save).not.toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.removeAdmin(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});

describe('Company Controller - getAdmins', () => {
    let req;
    let res;
    let mockCompany;
    let mockAdmins;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock company data with admins
        mockCompany = {
            _id: 'company123',
            name: 'Test Company',
            ownerId: { toString: () => 'owner123' },
            admins: ['owner123', 'admin456', 'admin789', 'inactive987'],
        };

        // Mock admin user data
        mockAdmins = [
            {
                _id: 'owner123',
                firstName: 'John',
                lastName: 'Owner',
                profilePicture: 'owner.jpg',
                location: 'New York',
                industry: 'Technology',
                headline: 'Company Owner',
                mainEducation: 0,
                education: [
                    {
                        school: 'Harvard',
                        degree: 'MBA',
                    },
                ],
                about: { description: 'Company founder' },
                profilePrivacySettings: {},
            },
            {
                _id: 'admin456',
                firstName: 'Jane',
                lastName: 'Admin',
                profilePicture: 'admin.jpg',
                location: 'San Francisco',
                industry: 'Marketing',
                headline: 'Marketing Director',
                mainEducation: 1,
                education: [
                    {
                        school: 'Stanford',
                        degree: 'BS',
                    },
                    {
                        school: 'MIT',
                        degree: 'MS',
                    },
                ],
                about: { description: 'Marketing expert' },
                profilePrivacySettings: {},
            },
            {
                _id: 'admin789',
                firstName: 'Sam',
                lastName: 'Manager',
                profilePicture: 'manager.jpg',
                location: 'Chicago',
                industry: 'Sales',
                headline: 'Sales Manager',
                mainEducation: null,
                education: [],
                about: { description: 'Sales professional' },
                profilePrivacySettings: {},
            },
        ];

        // Set up request object with pagination
        req = {
            params: { companyId: 'company123' },
            user: { id: 'visitor123' },
            query: { page: '1', limit: '2' },
        };

        // Set up response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Configure mock implementations
        companyModel.findById.mockResolvedValue(mockCompany);
        userModel.find.mockResolvedValue(mockAdmins);
    });

    test('should return 404 if company not found', async () => {
        // Arrange
        companyModel.findById.mockResolvedValueOnce(null);

        // Act
        await companyController.getAdmins(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
        expect(userModel.find).not.toHaveBeenCalled();
    });

    test('should handle internal server errors', async () => {
        // Arrange
        companyModel.findById.mockRejectedValueOnce(
            new Error('Database error')
        );

        // Act
        await companyController.getAdmins(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});
