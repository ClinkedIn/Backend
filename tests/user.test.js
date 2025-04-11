/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require('supertest');
const express = require('express');
const userModel = require('../models/userModel');
const companyModel = require('../models/companyModel');
const mongoose = require('mongoose');
const {
    getMe,
    getAllUsers,
    getUserProfile,
    addEducation,
    editEducation,
    getEducation,
    getEducations,
    deleteEducation,
    editIntro,
    addExperience,
    getAllExperiences,
    updateExperience,
    sortWorkExperience,
    addSkill,
    getAllSkills,
    updateSkill,
    uploadProfilePicture,
    uploadCoverPicture,
    getResume,
    uploadResume,
    deleteResume,
    deleteSkill,
    deleteExperience,
    deleteProfilePicture,
    deleteCoverPicture,
    getSkill,
    getExperience,
    getProfilePicture,
    getCoverPicture,
    addEndorsement,
    deleteEndorsement,
    updatePrivacySettings,
    followEntity,
    unfollowEntity,
    editContactInfo,
    editAbout,
    uploadPicture
} = require('../controllers/userProfileController');
const { uploadFile, uploadMultipleImages, deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const uploadMiddleware = require('../middlewares/multer');

jest.mock('../controllers/userProfileController', () => {
    const actualModule = jest.requireActual('../controllers/userProfileController');
    return {
        ...actualModule,
        uploadPicture: jest.fn(),
    };
});

jest.mock('../controllers/userProfileController', () => {
    const actualModule = jest.requireActual('../controllers/userProfileController');
    return {
        ...actualModule,
        uploadPicture: jest.fn(),
    };
});

jest.mock('../utils/userProfileUtils', () => ({
    validateSkillName: jest.requireActual('../utils/userProfileUtils').validateSkillName,
    validateEndorsements: jest.requireActual('../utils/userProfileUtils').validateEndorsements,
    sortWorkExperience: jest.requireActual('../utils/userProfileUtils').sortWorkExperience,
    uploadPicture: jest.requireActual('../utils/filesHandler').uploadPicture,
    validatePicture: jest.requireActual('../utils/filesHandler').validatePicture,
    updateSkillExperienceReferences: jest.requireActual('../utils/userProfileUtils').updateSkillExperienceReferences
  }));

jest.mock('../models/userModel');
jest.mock('../utils/cloudinaryUpload', () => ({
    uploadFile: jest.fn(), // Mock upload function
    uploadMultipleImages: jest.fn(),
    deleteFileFromUrl: jest.fn()
}));

const app = express();
app.use(express.json());

const mockVerifyToken = (req, res, next) => {
    req.user = { id: 'cc81c18d6b9fc1b83e2bebe3' };
    next();
};
//------------------------------EDUCATION TESTS---------------------------------
app.post('/education', mockVerifyToken, addEducation);

describe('POST /education', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    let mockUser;
    const mockUserId = '0b3169152ee6c171d25e6860';
    test('should successfully add education', async () => {
        const mockEducationData = {
            school: 'Harvard University',
            degree: 'B.Sc. Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2018-09-01',
            endDate: '2022-06-01',
            grade: '3.9',
            activities: 'Coding Club',
            description: 'Focused on AI research',
            skills: ['JavaScript', 'Python'],
            media: ['link-to-certificate']
        };
        
        const mockUpdatedUser = {
            _id: 'a0a20b073ac7c8facebfaa11',
            education: [mockEducationData],
            skills: [],
            save: jest.fn().mockResolvedValue(true) // Changed this line
        };
        
        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        const response = await request(app)
            .post('/education')
            .send(mockEducationData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education added successfully');
        expect(response.body.education).toEqual(mockEducationData);
    });

    test('should return 400 if school name is missing', async () => {
        const response = await request(app)
            .post('/education')
            .send({ degree: 'B.Sc. Computer Science' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .post('/education')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });
    test('should return 500 on server error', async () => {
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database failure'));
        const response = await request(app)
            .post('/education')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add education');
        expect(response.body.details).toBe('Database failure');
    });
});

app.get('/education/:index', mockVerifyToken, getEducation);
describe('GET /education/:index', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully get specific education entry', async () => {
        const mockEducation = {
            school: 'Harvard University',
            degree: 'B.Sc. Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2020-09-01',
            endDate: '2024-06-30'
        };

        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [mockEducation]
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .get('/education/0');

        expect(response.status).toBe(200);
        expect(response.body.education).toEqual(mockEducation);
    });

    test('should return 404 if user not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .get('/education/0');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 for invalid index', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'Harvard' }]
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .get('/education/999');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid education index');
    });
    test('should return 500 on server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .get('/education/0');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});

app.patch('/education/:index', mockVerifyToken, editEducation);
describe('PATCH /education/:index', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update education entry', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [
                {
                    school: 'Old School Name',
                    degree: 'Old Degree',
                    fieldOfStudy: 'Old Field',
                    startDate: '2018-09-01',
                    endDate: '2022-06-01'
                }
            ],
            save: jest.fn().mockResolvedValue(true)
        };

        userModel.findById.mockResolvedValue(mockUser);

        const updatedData = {
            school: 'New School Name',
            degree: 'New Degree',
            fieldOfStudy: 'Computer Science',
            startDate: '2019-09-01',
            endDate: '2023-06-01'
        };

        const response = await request(app)
            .patch('/education/0')
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education updated successfully');
        expect(response.body.education).toEqual(expect.objectContaining(updatedData));
        expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .patch('/education/0')
            .send({ school: 'New School Name' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 if education index is out of bounds', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'School 1' }],
            save: jest.fn()
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .patch('/education/5') // Invalid index
            .send({ school: 'New School Name' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Education not found');
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 404 if education index is negative', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'School 1' }],
            save: jest.fn()
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .patch('/education/-1') // Invalid index
            .send({ school: 'New School Name' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Education not found');
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 400 if school name is empty', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'Old School' }],
            save: jest.fn()
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .patch('/education/0')
            .send({ school: '' }); // Empty school name

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 400 if school name contains only whitespace', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'Old School' }],
            save: jest.fn()
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .patch('/education/0')
            .send({ school: '   ' }); // Only whitespace

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
        expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 500 if database error occurs', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/education/0')
            .send({ school: 'New School Name' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to update education');
        expect(response.body.details).toBe('Database error');
    });
});

app.delete('/education/:index', mockVerifyToken, deleteEducation);
describe('DELETE /education/:index', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully delete education entry and return updated education array', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [
                { school: 'School 1' },
                { school: 'School 2' },
                { school: 'School 3' }
            ],
            save: jest.fn().mockResolvedValue(true)
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .delete('/education/1');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education deleted successfully');
        expect(response.body.educations).toHaveLength(2);
        expect(response.body.educations).toEqual([
            { school: 'School 1' },
            { school: 'School 3' }
        ]);
        expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/education/0');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 for invalid index', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            education: [{ school: 'School 1' }]
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .delete('/education/999');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid education index');
    });

    test('should return 500 on server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .delete('/education/0');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});
// Setup route
app.patch('/profile', mockVerifyToken, editIntro);

describe('PATCH /profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update user intro', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            headLine: 'Software Engineer',
            additionalName: 'JD',
            website: 'https://johndoe.com',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        const mockUpdatedUser = {
            ...mockIntroData,
            _id: 'f446a2fdbe47f4e4b820d6ce'
        };

        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Intro updated successfully');
        expect(response.body.user).toMatchObject({
            firstName: mockIntroData.firstName,
            lastName: mockIntroData.lastName,
            headLine: mockIntroData.headLine,
            additionalName: mockIntroData.additionalName,
            website: mockIntroData.website,
            location: mockIntroData.location,
            industry: mockIntroData.industry
        });
    });

    test('should return 400 if required fields are missing', async () => {
        const incompleteData = {
            firstName: 'John',
            lastName: 'Doe'
            // Missing other required fields
        };

        const response = await request(app)
            .patch('/profile')
            .send(incompleteData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
        expect(response.body.missingFields).toContain('headLine');
        expect(response.body.missingFields).toContain('location');
        expect(response.body.missingFields).toContain('industry');
        expect(response.body.missingFields).toContain('mainEducation');
    });

    test('should return 404 if user not found', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            headLine: 'Software Engineer',
            website: 'https://johndoe.com',
            additionalName: 'JD',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 on server error', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            headLine: 'Software Engineer',
            website: 'https://johndoe.com',
            additionalName: 'JD',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to update profile');
        expect(response.body.details).toBe('Database failure');
    });
});


app.post('/experience', mockVerifyToken, uploadMiddleware.single('file'), addExperience);
app.get('/experience', mockVerifyToken, getAllExperiences);

app.get('/experience/:index', mockVerifyToken, getExperience)
app.put('/experience/:index', mockVerifyToken, uploadMiddleware.single('file'), updateExperience);
app.delete('/experience/:index', mockVerifyToken, deleteExperience);

describe('POST /experience - addExperience', () => {
    let mockUser;
    const mockUserId = '0b3169152ee6c171d25e6860';

    beforeEach(() => {
        jest.clearAllMocks();

        mockUser = {
            _id: mockUserId,
            workExperience: [],
            skills: ["React"],
            save: jest.fn().mockResolvedValue()
        };

        userModel.findById.mockResolvedValue(mockUser);
    });

    test('Should add experience successfully', async () => {
        const experienceData = {
            jobTitle: 'Software Engineer',
            companyName: 'Tech Corp',
            fromDate: '2022-01-01',
            currentlyWorking: true,
            skills: ['JavaScript', 'React'],
            employmentType: 'Full Time',
            location: 'New York',
            locationType: 'On-site',
            description: 'Developed web applications',
            foundVia: 'LinkedIn'
        };

        const response = await request(app)
            .post('/experience')
            .send(experienceData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');
        expect(response.body.experience).toMatchObject({
            jobTitle: 'Software Engineer',
            companyName: 'Tech Corp',
            fromDate: '2022-01-01',
            currentlyWorking: true,
            skills: ['JavaScript', 'React'],
            employmentType: 'Full Time',
            location: 'New York',
            locationType: 'On-site',
            description: 'Developed web applications',
            foundVia: 'LinkedIn'
        });
        expect(mockUser.workExperience.length).toBe(1);
        expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    test('Should return 400 if jobTitle is missing', async () => {
        const experienceData = {
            companyName: 'Tech Corp',
            fromDate: '2022-01-01',
            currentlyWorking: true,
            skills: ['JavaScript', 'React'],
            employmentType: 'Full-time',
            location: 'New York',
            locationType: 'On-site',
            description: 'Developed web applications',
            foundVia: 'LinkedIn'
        };

        const response = await request(app)
            .post('/experience')
            .send(experienceData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Job title, company name, and start date are required');
    });

    test('Should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .post('/experience')
            .send({ jobTitle: 'Developer', companyName: 'ABC' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('Should handle internal server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/experience')
            .send({ jobTitle: 'Developer', companyName: 'ABC' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });

    test('Should return 400 if media upload fails', async () => {
        uploadPicture.mockRejectedValue(new Error('Upload error'));

        const response = await request(app)
            .post('/experience')
            .field('jobTitle', 'Software Engineer')
            .field('companyName', 'Tech Corp')
            .field('fromDate', '2022-01-01')
            .field('currentlyWorking', true)
            .field('employmentType', 'Full Time')
            .attach('file', Buffer.from('mockFileContent'), { filename: 'photo.png', contentType: 'image/jpeg' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Failed to upload media');
    });
});

describe('GET /experience - Get User Experiences', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    it('should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null); // Simulate user not found

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    it('should return 200 and user experiences if user exists', async () => {
        const mockUser = {
            _id: userId,
            experience: [
                { title: 'Software Engineer', company: 'Tech Corp', fromDate: '2023-01-01', currentlyWorking: true }
            ]
        };

        userModel.findById.mockResolvedValue(mockUser); // Simulate found user

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(200);
        expect(response.body.experiences).toEqual(mockUser.experience);
    });

    it('should return 500 if there is a server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error')); // Simulate DB error

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});


describe('GET /experience/:index', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID
    const experienceIndex = 1; // Mock experience index
    const mockWorkExperience = [
        { company: 'Company A', role: 'Developer' },
        { company: 'Company B', role: 'Manager' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return experience successfully', async () => {
        // Mock userModel.findById to return a user with workExperience
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                workExperience: mockWorkExperience
            })
        }));

        const response = await request(app)
            .get(`/experience/${experienceIndex}`);

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.experience).toEqual(mockWorkExperience[experienceIndex]);
    });

    test('should return 400 for invalid experience index (NaN)', async () => {
        const invalidIndex = 'invalid';

        const response = await request(app)
            .get(`/experience/${invalidIndex}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience index');
    });

    test('should return 400 for invalid experience index (negative)', async () => {
        const invalidIndex = -1;

        const response = await request(app)
            .get(`/experience/${invalidIndex}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience index');
    });

    test('should return 400 for invalid experience index (out of range)', async () => {
        // Mock userModel.findById to return a user with workExperience
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                workExperience: mockWorkExperience
            })
        }));

        const invalidIndex = mockWorkExperience.length; // Out of range index

        const response = await request(app)
            .get(`/experience/${invalidIndex}`);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Experience index out of range');
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .get(`/experience/${experienceIndex}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .get(`/experience/${experienceIndex}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
        expect(response.body.details).toBe('Database error');
    });
});

describe('PUT /experience/:index - Update Work Experience', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';
    let mockUser;

    beforeEach(() => {
        mockUser = {
            _id: userId,
            workExperience: [
                {
                    jobTitle: 'Junior Developer',
                    companyName: 'Small Company',
                    fromDate: '2015-01-01',
                    toDate: '2023-11-30',
                    currentlyWorking: false
                },
                {
                    jobTitle: 'Senior SWE',
                    companyName: 'Google',
                    fromDate: '2022-10-01',
                    toDate: '2022-12-01',
                    currentlyWorking: false
                }
            ],
            save: jest.fn().mockResolvedValue(true)
        };
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Reset mocks after each test
    });

    test('should update experience and sort it correctly', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const updatedExperience = {
            jobTitle: 'Tech Lead',
            fromDate: '2023-05-01', // Newer date to test sorting
            toDate: '2024-01-01',
            currentlyWorking: false
        };

        const response = await request(app)
            .put('/experience/1') // Update second experience (Google)
            .send(updatedExperience);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience updated successfully');

        // Ensure experience was updated
        expect(mockUser.workExperience[0].jobTitle).toBe('Tech Lead');

        // Ensure sorting is correct (newest first)
        const sortedJobTitles = response.body.sortedWorkExperience.map(exp => exp.jobTitle);
        expect(sortedJobTitles).toEqual(['Tech Lead', 'Junior Developer']);

        expect(mockUser.save).toHaveBeenCalled(); // Ensure save() was called
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null); // Simulate user not found

        const response = await request(app)
            .put('/experience/0')
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 if experience index is out of range', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/5') // Invalid index
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Experience not found');
    });

    test('should return 404 if experience index is negative', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/-1') // Invalid index
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Experience not found');
    });

    test('should return 400 if fromDate is invalid', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/0')
            .send({ fromDate: 'invalid-date' }); // Invalid date

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid Data');
    });

    test('should return 400 if toDate is invalid', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/0')
            .send({ toDate: 'invalid-date' }); // Invalid date

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid Data');
    });

    test('should return 500 if there is a server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error')); // Simulate DB error

        const response = await request(app)
            .put('/experience/0')
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});

describe('DELETE /experience/:index', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID
    const experienceIndex = 1; // Mock experience index
    const mockWorkExperience = [
        { company: 'Company A', role: 'Developer' },
        { company: 'Company B', role: 'Manager' }
    ];
    const mockSkills = [
        { skillName: 'Problem Solving', experience: [0, 1] },
        { skillName: 'Communication', experience: [1] }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should delete experience successfully', async () => {
        // Mock userModel.findById to return a user with workExperience and skills
        const mockUser = {
            _id: userId,
            workExperience: mockWorkExperience,
            skills: mockSkills,
            save: jest.fn().mockResolvedValue(true)
        };
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));

        const response = await request(app)
            .delete(`/experience/${experienceIndex}`);

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience deleted successfully');
        expect(response.body.deletedExperience).toEqual({ company: 'Company B', role: 'Manager' });
        expect(response.body.updatedSkills).toEqual([
            { skillName: 'Problem Solving', experience: [0] }, // Index 1 removed and shifted
            { skillName: 'Communication', experience: [] } // Index 1 removed
        ]);
    });

    test('should return 400 for invalid experience index (NaN)', async () => {
        const invalidIndex = 'invalid';

        const response = await request(app)
            .delete(`/experience/${invalidIndex}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience index');
    });

    test('should return 400 for invalid experience index (negative)', async () => {
        const invalidIndex = -1;

        const response = await request(app)
            .delete(`/experience/${invalidIndex}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience index');
    });

    test('should return 400 for invalid experience index (out of bounds)', async () => {
        // Mock userModel.findById to return a user with workExperience
        const mockUser = {
            _id: userId,
            workExperience: mockWorkExperience,
            skills: mockSkills,
            save: jest.fn().mockResolvedValue(true)
        };
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));

        const invalidIndex = mockWorkExperience.length; // Out of bounds index

        const response = await request(app)
            .delete(`/experience/${invalidIndex}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience index');
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .delete(`/experience/${experienceIndex}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .delete(`/experience/${experienceIndex}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
        expect(response.body.details).toBe('Database error');
    });
});

/*
Skills Section Tests
*/ 


app.post('/skills', mockVerifyToken, addSkill);
app.get('/skills', mockVerifyToken, getAllSkills);

app.put('/skills/:skillName', mockVerifyToken, updateSkill);
app.delete('/skills/:skillName', mockVerifyToken, deleteSkill);
app.get('/skills/:skillName', mockVerifyToken, getSkill);

describe('POST /skills', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a skill successfully', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        const mockSkillData = {
            skillName: 'Problem Solving',
            educationIndexes: [0],
            experienceIndexes: [1]
        };

        const mockUser = {
            _id: mockUserId,
            education: [{}], // Mocking one education entry
            workExperience: [{}, {}], // Mocking two work experience entries
            skills: []
        };

        const mockUpdatedUser = {
            _id: mockUserId,
            education: [{}],
            workExperience: [{}, {}],
            skills: [{ 
                skillName: 'Problem Solving', 
                education: [0], 
                experience: [1],
                endorsements: [] 
            }]
        };

        // Mock validateSkillName helper function
        const validateSkillName = jest.fn().mockResolvedValue({ valid: true });
        global.validateSkillName = validateSkillName;

        userModel.exists.mockResolvedValue(false); // Skill does not exist
        userModel.findById.mockResolvedValue(mockUser); // User found
        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser); // Simulating skill addition
        userModel.updateOne.mockResolvedValue({ nModified: 1 }); // Mock successful updates

        // Mock the req.user object that would be set by authentication middleware
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData)
            .set('x-mock-user', JSON.stringify(mockReq.user)); // Setting mock user in request

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill added successfully');
        expect(response.body.skill).toEqual({
            skillName: 'Problem Solving',
            education: [0],
            experience: [1],
            endorsements: []
        });
    });

    test('should return 400 if skill already exists', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // Mock validateSkillName helper function
        const validateSkillName = jest.fn().mockResolvedValue({ valid: true });
        global.validateSkillName = validateSkillName;
        
        userModel.exists.mockResolvedValue(true); // Skill exists

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Problem Solving', educationIndexes: [0] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill already exists');
    });

    test('should return 400 if skill name is invalid', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // Mock validateSkillName helper function to return invalid
        const validateSkillName = jest.fn().mockResolvedValue({ valid: false, message: 'Invalid skill name' });
        global.validateSkillName = validateSkillName;

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ skillName: '', educationIndexes: [0] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid skill name');
    });

    test('should handle education indexes correctly when not an array', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.exists.mockResolvedValue(false);
        
        const mockUser = {
            _id: mockUserId,
            education: [{}],
            workExperience: [{}],
            skills: []
        };
        
        const mockUpdatedUser = {
            _id: mockUserId,
            education: [{}],
            workExperience: [{}],
            skills: [{ 
                skillName: 'Critical Thinking', 
                education: [], 
                experience: [],
                endorsements: [] 
            }]
        };
        
        userModel.findById.mockResolvedValue(mockUser);
        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: "notAnArray" })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        // The function should handle this case by setting an empty array
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill added successfully');
        expect(response.body.skill.education).toEqual([]);
    });

    test('should filter out invalid education and experience indexes', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        const mockUser = {
            _id: mockUserId,
            education: [{}], // Only one valid index (0)
            workExperience: [{}], // Only one valid index (0)
            skills: []
        };
        
        const mockUpdatedUser = {
            _id: mockUserId,
            education: [{}],
            workExperience: [{}],
            skills: [{ 
                skillName: 'Critical Thinking', 
                education: [0], 
                experience: [0],
                endorsements: [] 
            }]
        };

        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(mockUser);
        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);
        userModel.updateOne.mockResolvedValue({ nModified: 1 });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ 
                skillName: 'Critical Thinking', 
                educationIndexes: [0, 5], // Index 5 is out of bounds
                experienceIndexes: [0, 3]  // Index 3 is out of bounds
            })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill added successfully');
        expect(response.body.skill.education).toEqual([0]); // Only valid index
        expect(response.body.skill.experience).toEqual([0]); // Only valid index
    });

    test('should return 404 if user is not found', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(null); // Simulating a missing user

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: [] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database update fails', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';

        const mockUser = {
            _id: mockUserId,
            education: [{}],
            workExperience: [{}]
        };

        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(mockUser);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: [0] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

describe('GET /skills', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID
    const mockSkills = [
        { skillName: 'Problem Solving', level: 'Intermediate' },
        { skillName: 'Communication', level: 'Advanced' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return all skills for the user', async () => {
        // Mock userModel.findById to return a user with skills
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                skills: mockSkills
            })
        }));

        const response = await request(app)
            .get('/skills');

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.skills).toEqual(mockSkills);
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .get('/skills');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .get('/skills');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
        expect(response.body.details).toBe('Database error');
    });
});

describe('GET /skills/:skillName', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID
    const skillName = 'Problem Solving'; // Mock skill name

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return the skill if found', async () => {
        const mockSkill = { skillName: 'Problem Solving', level: 'Intermediate' };

        // Mock userModel.findById to return a user with the skill
        userModel.findById.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({
                _id: userId,
                skills: [mockSkill]
            })
        }));

        const response = await request(app)
            .get(`/skills/${skillName}`);

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.skill).toEqual(mockSkill);
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .get(`/skills/${skillName}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 404 if skill is not found', async () => {
        // Mock userModel.findById to return a user with no matching skill
        userModel.findById.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({
                _id: userId,
                skills: []
            })
        }));

        const response = await request(app)
            .get(`/skills/${skillName}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .get(`/skills/${skillName}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
        expect(response.body.details).toBe('Database error');
    });
});

describe('PUT /skills/:skillName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if no updates are provided', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // mock this
        //const user = await userModel.findById(userId, "skills education workExperience");
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: [],
            workExperience: []
        });
        
        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No valid updates provided');
    });

    test('should return 400 if new skill name is invalid', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // Mock validateSkillName to return invalid
        const validateSkillName = jest.fn().mockReturnValue({ valid: false, message: 'Invalid skill name' });
        global.validateSkillName = validateSkillName;
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: '!' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid skill name');
    });

    test('should return 400 if new skill name already exists in user profile', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // Mock validateSkillName to return valid
        const validateSkillName = jest.fn().mockReturnValue({ valid: true });
        global.validateSkillName = validateSkillName;
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [
                { skillName: 'Problem Solving', education: [] },
                { skillName: 'Critical Thinking', education: [] },
            ],
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill already exists');
    });

    test('should return 400 if education indexes contain invalid values', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: [{}, {}], // Two education entries
            workExperience: []
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ educationIndexes: [0, 5] }) // Invalid index 5
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some provided education indexes are invalid');
    });

    test('should return 400 if experience indexes contain invalid values', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [], experience: [] }],
            education: [],
            workExperience: [{}, {}] // Two work experience entries
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ experienceIndexes: [0, 5] }) // Invalid index 5
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some provided experience indexes are invalid');
    });

    test('should return 400 if educationIndexes is not an array', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: [{}, {}],
            workExperience: []
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ educationIndexes: "not an array" })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid education indexes format');
    });

    test('should return 400 if experienceIndexes is not an array', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [], experience: [] }],
            education: [],
            workExperience: [{}, {}]
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ experienceIndexes: "not an array" })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid experience indexes format');
    });

    test('should return 404 if user is not found', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.findById.mockResolvedValue(null);

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 404 if skill is not found', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Critical Thinking', education: [] }],
            education: [],
            workExperience: []
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Creative Thinking' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    test('should update skill name successfully', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        // Mock validateSkillName to return valid
        const validateSkillName = jest.fn().mockReturnValue({ valid: true });
        global.validateSkillName = validateSkillName;
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: [],
            workExperience: []
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [{ skillName: 'Critical Thinking', education: [] }],
        });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill updated successfully');
        expect(response.body.skills).toBeDefined();
    });

    test('should update skill education indexes successfully', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: [{}, {}, {}], // Three education entries
            workExperience: []
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [0, 2] }],
        });
        
        userModel.updateOne.mockResolvedValue({ nModified: 1 });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ educationIndexes: [0, 2] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill updated successfully');
        expect(response.body.skills).toBeDefined();
    });

    test('should update skill experience indexes successfully', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [], experience: [] }],
            education: [],
            workExperience: [{}, {}, {}] // Three work experience entries
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [], experience: [1, 2] }],
        });
        
        userModel.updateOne.mockResolvedValue({ nModified: 1 });

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ experienceIndexes: [1, 2] })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill updated successfully');
        expect(response.body.skills).toBeDefined();
    });

    test('should return 500 if an internal server error occurs', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        
        userModel.findById.mockRejectedValue(new Error('Database error'));

        // Mock the req.user object
        const mockReq = {
            user: { id: mockUserId }
        };

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' })
            .set('x-mock-user', JSON.stringify(mockReq.user));

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

describe('DELETE /skills/:skillName', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID
    const skillName = 'Problem Solving'; // Mock skill name

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 404 if skill is not found', async () => {
        // Mock userModel.findOne to return a user with no matching skill
        userModel.findOne.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ _id: userId, skills: [] })
        }));

        const response = await request(app)
            .delete(`/skills/${skillName}`);

        console.log('Response Status:', response.status); // Debugging: Log the response status
        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findOne to return a user with the skill
        userModel.findOne.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({
                _id: userId,
                skills: [{ skillName: new RegExp(`^${skillName}$`, 'i') }]
            })
        }));

        // Mock userModel.findByIdAndUpdate to return null (user not found)
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .delete(`/skills/${skillName}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should delete skill successfully', async () => {
        const skillToDelete = { skillName: 'Problem Solving' }; // Use plain skill name
    
        // Mock userModel.findOne to return a user with the skill
        userModel.findOne.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({
                _id: userId,
                skills: [skillToDelete] // Use plain skill name
            })
        }));
    
        // Mock userModel.findByIdAndUpdate to return the updated user
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            skills: [] // Skill removed
        });
    
        // Mock userModel.updateMany to simulate removing the skill from education and work experience
        userModel.updateMany.mockResolvedValue({});
    
        const response = await request(app)
            .delete(`/skills/${skillName}`)
            .set('x-mock-user', JSON.stringify({ id: userId })); // Simulate authenticated user
    
        console.log('Response Body:', response.body); // Debugging: Log the response body
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill deleted successfully');
        expect(response.body.deletedSkill).toEqual(skillToDelete); // Use plain skill name
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findOne to throw an error
        userModel.findOne.mockImplementation(() => ({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .delete(`/skills/${skillName}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
        expect(response.body.details).toBe('Database error');
    });
});

app.post('/skills/endorsements/add-endorsement', mockVerifyToken, addEndorsement);
app.delete('/skills/endorsements/remove-endorsement/:skillName', mockVerifyToken, deleteEndorsement);

describe('Search Controllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchUsers', () => {
        test('should search users with query parameters', async () => {
            const mockUsers = [
                { 
                    _id: '1', 
                    firstName: 'John', 
                    lastName: 'Doe',
                    company: 'Tech Corp',
                    industry: 'Technology',
                    profilePicture: 'pic1.jpg'
                }
            ];

            userModel.find = jest.fn().mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }));

            userModel.countDocuments = jest.fn().mockResolvedValue(1);

            const response = await request(app)
                .get('/users/search')
                .query({
                    query: 'john',
                    company: 'Tech',
                    industry: 'Technology',
                    page: 1,
                    limit: 10
                });

            expect(response.status).toBe(200);
            expect(response.body.users).toEqual(mockUsers);
            expect(response.body.pagination).toEqual({
                total: 1,
                page: 1,
                pages: 1
            });
        });
    });

    describe('searchUsersByName', () => {
        test('should search users by name', async () => {
            const mockUsers = [
                { 
                    _id: '1', 
                    firstName: 'John', 
                    lastName: 'Doe',
                    profilePicture: 'pic1.jpg'
                }
            ];

            userModel.find = jest.fn().mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }));

            userModel.countDocuments = jest.fn().mockResolvedValue(1);

            const response = await request(app)
                .get('/users/search/name')
                .query({
                    name: 'john',
                    page: 1,
                    limit: 10
                });

            expect(response.status).toBe(200);
            expect(response.body.users).toEqual(mockUsers);
            expect(response.body.pagination).toEqual({
                total: 1,
                page: 1,
                pages: 1
            });
        });
    });
});

describe('Connection Controllers', () => {
    const userId = 'user123';
    const targetUserId = 'target456';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendConnectionRequest', () => {
        test('should send connection request successfully', async () => {
            const mockUser = {
                _id: userId,
                connectionList: [],
                blockedUsers: []
            };

            const mockTargetUser = {
                _id: targetUserId,
                pendingConnections: [],
                blockedUsers: []
            };

            userModel.findById = jest.fn()
                .mockImplementationOnce(() => Promise.resolve(mockUser))
                .mockImplementationOnce(() => Promise.resolve(mockTargetUser));

            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .post(`/connections/request/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connection request sent successfully');
        });

        test('should handle duplicate connection request', async () => {
            const mockUser = {
                _id: userId,
                connectionList: [],
                blockedUsers: []
            };

            const mockTargetUser = {
                _id: targetUserId,
                pendingConnections: [userId],
                blockedUsers: []
            };

            userModel.findById = jest.fn()
                .mockImplementationOnce(() => Promise.resolve(mockUser))
                .mockImplementationOnce(() => Promise.resolve(mockTargetUser));

            const response = await request(app)
                .post(`/connections/request/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Connection request already sent');
        });
    });

    describe('handleConnectionRequest', () => {
        test('should accept connection request successfully', async () => {
            const mockUser = {
                _id: userId,
                pendingConnections: [targetUserId]
            };

            userModel.findById = jest.fn().mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .post(`/connections/handle/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`)
                .send({ action: 'accept' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connection request accepted successfully');
        });

        test('should decline connection request successfully', async () => {
            const mockUser = {
                _id: userId,
                pendingConnections: [targetUserId]
            };

            userModel.findById = jest.fn().mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .post(`/connections/handle/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`)
                .send({ action: 'decline' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connection request declined successfully');
        });
    });

    describe('getConnections', () => {
        test('should get user connections with pagination', async () => {
            const mockConnections = [
                { 
                    _id: '1', 
                    firstName: 'John', 
                    lastName: 'Doe',
                    profilePicture: 'pic1.jpg',
                    company: 'Tech Corp',
                    position: 'Developer'
                }
            ];

            const mockUser = {
                _id: userId,
                connectionList: mockConnections
            };

            userModel.findById = jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser)
            }));

            const response = await request(app)
                .get('/connections')
                .set('Authorization', `Bearer ${generateTestToken(userId)}`)
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.connections).toEqual(mockConnections);
            expect(response.body.pagination).toEqual({
                total: 1,
                page: 1,
                pages: 1
            });
        });
    });

    describe('removeConnection', () => {
        test('should remove connection successfully', async () => {
            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .delete(`/connections/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connection removed successfully');
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
        });
    });
});

describe('Blocking Controllers', () => {
    const userId = 'user123';
    const targetUserId = 'target456';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('blockUser', () => {
        test('should block user successfully', async () => {
            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .post(`/users/block/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User blocked successfully');
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
        });
    });

    describe('unblockUser', () => {
        test('should unblock user successfully', async () => {
            userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const response = await request(app)
                .post(`/users/unblock/${targetUserId}`)
                .set('Authorization', `Bearer ${generateTestToken(userId)}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User unblocked successfully');
        });
    });

    describe('getBlockedUsers', () => {
        test('should get blocked users with pagination', async () => {
            const mockBlockedUsers = [
                { 
                    _id: '1', 
                    firstName: 'John', 
                    lastName: 'Doe',
                    profilePicture: 'pic1.jpg'
                }
            ];

            const mockUser = {
                _id: userId,
                blockedUsers: mockBlockedUsers
            };

            userModel.findById = jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser)
            }));

            const response = await request(app)
                .get('/users/blocked')
                .set('Authorization', `Bearer ${generateTestToken(userId)}`)
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.blockedUsers).toEqual(mockBlockedUsers);
            expect(response.body.pagination).toEqual({
                total: 1,
                page: 1,
                pages: 1
            });
        });
    });
});

// Helper function to generate test JWT token
function generateTestToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
}

describe("POST /skills/endorsements/add-endorsement", () => {
    const mockUserId = "0b3169152ee6c171d25e6860";
    const mockEndorserId = "d29ccbd4ac1b1cb9faefb867";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully endorse a skill", async () => {
        userModel.findOne.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: "JavaScript", endorsements: [] }]
        });
        userModel.findOneAndUpdate.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: "JavaScript", endorsements: [mockEndorserId] }]
        });

        const response = await request(app)
            .post("/skills/endorsements/add-endorsement")
            .send({ skillOwnerId: mockUserId, skillName: "JavaScript" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Skill endorsement created successfully");
        expect(response.body.skill.endorsements).toContain(mockEndorserId);
    });

    it("should return 400 if user tries to endorse their own skill", async () => {
        const response = await request(app)
            .post("/skills/endorsements/add-endorsement")
            .send({ skillOwnerId: "cc81c18d6b9fc1b83e2bebe3", skillName: "JavaScript" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User cannot endorse himself");
    });

    it("should return 404 if user or skill does not exist", async () => {
        userModel.findOne.mockResolvedValue(null);
        
        const response = await request(app)
            .post("/skills/endorsements/add-endorsement")
            .send({ skillOwnerId: mockUserId, skillName: "Python" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User or skill not found");
    });

    it("should return 400 if skill has already been endorsed by the user", async () => {
        userModel.findOne.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: "JavaScript", endorsements: ["cc81c18d6b9fc1b83e2bebe3"] }]
        });

        const response = await request(app)
            .post("/skills/endorsements/add-endorsement")
            .send({ skillOwnerId: mockUserId, skillName: "JavaScript" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("You have already endorsed this skill once");
    });

    it("should return 500 if there is a server error", async () => {
        userModel.findOne.mockRejectedValue(new Error("Database error"));
        
        const response = await request(app)
            .post("/skills/endorsements/add-endorsement")
            .send({ skillOwnerId: mockUserId, skillName: "JavaScript" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
    });
});


describe("DELETE /skills/endorsements/remove-endorsement/:skillName", () => {
    let userId, skillOwnerId, skillName;

    beforeEach(() => {
        userId = "cc81c18d6b9fc1b83e2bebe3";
        skillOwnerId = "d29ccbd4ac1b1cb9faefb867";
        skillName = "JavaScript";
    });

    it("should successfully delete an endorsement", async () => {
        const user = {
            _id: skillOwnerId,
            skills: [{ skillName, endorsements: [userId] }],
        };

        userModel.findOne.mockResolvedValue(user);
        userModel.findOneAndUpdate.mockResolvedValue({
            ...user,
            skills: [{ skillName, endorsements: [] }],
        });

        const res = await request(app)
            .delete(`/skills/endorsements/remove-endorsement/${skillName}`)
            .send({ skillOwnerId });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Skill endorsement deleted successfully");
        expect(res.body.skill.endorsements).toHaveLength(0);
    });

    it("should return 404 if user is not found", async () => {
        userModel.findOne.mockResolvedValue(null);

        const res = await request(app)
            .delete(`/skills/endorsements/remove-endorsement/${skillName}`)
            .send({ skillOwnerId });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("User or skill not found");
    });

    it("should return 404 if skill does not exist", async () => {
        userModel.findOne.mockResolvedValue(null);

        const res = await request(app)
            .delete(`/skills/endorsements/remove-endorsement/${skillName}`)
            .send({ skillOwnerId });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("User or skill not found");
    });

    it("should return 404 if endorsement is not found", async () => {
        userModel.findOne.mockResolvedValue({
            _id: skillOwnerId,
            skills: [{ skillName, endorsements: [] }],
        });

        const res = await request(app)
            .delete(`/skills/endorsements/remove-endorsement/${skillName}`)
            .send({ skillOwnerId });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("No endorsement found from this user for this skill");
    });

    it("should handle server errors", async () => {
        userModel.findOne.mockRejectedValue(new Error("Database error"));

        const res = await request(app)
            .delete(`/skills/endorsements/remove-endorsement/${skillName}`)
            .send({ skillOwnerId });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Internal server error");
    });
});

/*
Profile and Cover Pictures Tests
*/

app.post('/add-profile-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadProfilePicture);
app.post('/add-cover-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadCoverPicture);

app.delete('/profile-picture', mockVerifyToken, deleteProfilePicture);
app.delete('/cover-picture', mockVerifyToken, deleteCoverPicture);

app.get('/profile-picture', mockVerifyToken, getProfilePicture);
app.get('/cover-picture', mockVerifyToken, getCoverPicture);

describe('POST /add-profile-picture', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully upload a profile picture', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]); // Simulated valid image buffer
        const mockUploadResult = { url: 'https://cloudinary.com/mock-image-url' };

        uploadFile.mockResolvedValue(mockUploadResult);

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            profilePicture: mockUploadResult.url,
        });

        const response = await request(app)
            .post('/add-profile-picture')
            .set('Content-Type', 'multipart/form-data')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Profile Picture updated successfully');
        expect(response.body.profilePicture).toBe(mockUploadResult.url);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { profilePicture: mockUploadResult.url },
            { new: true }
        );
    });

    test('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/add-profile-picture')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No file uploaded');
    });

    test('should return 400 for invalid file type', async () => {
        const mockTextBuffer = Buffer.from('This is a text file');

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockTextBuffer, { filename: 'test.txt', contentType: 'text/plain' });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed.');
    });


    test('should return 400 if file size exceeds limit', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0); // 10MB file

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('File size too large. Maximum allowed size is 5MB.');
    });


    test('should return 500 if database update fails', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]);
        const mockUploadResult = { url: 'https://cloudinary.com/mock-image-url' };

        uploadFile.mockResolvedValue(mockUploadResult);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });


    test('should return 404 if user is not found', async () => {
        uploadFile.mockResolvedValue({ url: 'https://cloudinary.com/mock-image-url' });
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', Buffer.from([0xff, 0xd8, 0xff]), { filename: 'profile.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });


    test('should return 500 if Cloudinary upload fails', async () => {
        uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

        const mockImageBuffer = Buffer.from('mockImageData');

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBeDefined();
    });

});

describe('GET /profile-picture', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return profile picture successfully', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        // Mock userModel.findById to return a user with profilePicture
        const mockProfilePicture = 'https://example.com/profile.jpg';
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                profilePicture: mockProfilePicture
            })
        }));

        const response = await request(app)
            .get('/profile-picture');

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.profilePicture).toBe(mockProfilePicture);
    });

    test('should return 404 if user is not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .get('/profile-picture');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 if profile picture is not set', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        // Mock userModel.findById to return a user without profilePicture
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                profilePicture: null
            })
        }));

        const response = await request(app)
            .get('/profile-picture');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('profile Picture not set');
    });

    test('should return 500 if an internal server error occurs', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .get('/profile-picture');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBe('Database error');
    });
});

describe('GET /cover-picture', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return cover picture successfully', async () => {
        // Mock userModel.findById to return a user with coverPicture
        const mockCoverPicture = 'https://example.com/cover.jpg';
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                coverPicture: mockCoverPicture
            })
        }));

        const response = await request(app)
            .get('/cover-picture');

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.coverPicture).toBe(mockCoverPicture);
    });

    test('should return 404 if user is not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)
        // Mock userModel.findById to return null (user not found)
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
            .get('/cover-picture');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 if cover picture is not set', async () => {

        // Mock userModel.findById to return a user without coverPicture
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                coverPicture: null
            })
        }));

        const response = await request(app)
            .get('/cover-picture');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('cover Picture not set');
    });

    test('should return 500 if an internal server error occurs', async () => {

        // Mock userModel.findById to throw an error
        userModel.findById.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));

        const response = await request(app)
            .get('/cover-picture');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBe('Database error');
    });
});


describe('POST /add-cover-picture', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully upload a cover picture', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]); // Simulated valid image buffer
        const mockUploadResult = { url: 'https://cloudinary.com/mock-cover-url' };

        uploadFile.mockResolvedValue(mockUploadResult);

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            coverPicture: mockUploadResult.url,
        });

        const response = await request(app)
            .post('/add-cover-picture')
            .set('Content-Type', 'multipart/form-data')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cover Picture updated successfully');
        expect(response.body.coverPicture).toBe(mockUploadResult.url);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { coverPicture: mockUploadResult.url },
            { new: true }
        );
    });

    test('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/add-cover-picture')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No file uploaded');
    });

    test('should return 400 for invalid file type', async () => {
        const mockTextBuffer = Buffer.from('This is a text file');

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockTextBuffer, { filename: 'test.txt', contentType: 'text/plain' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed.');
    });

    test('should return 400 if file size exceeds limit', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0); // 10MB file

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('File size too large. Maximum allowed size is 5MB.');
    });

    test('should return 500 if database update fails', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]);
        const mockUploadResult = { url: 'https://cloudinary.com/mock-cover-url' };

        uploadFile.mockResolvedValue(mockUploadResult);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });

    test('should return 404 if user is not found', async () => {
        uploadFile.mockResolvedValue({ url: 'https://cloudinary.com/mock-cover-url' });
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', Buffer.from([0xff, 0xd8, 0xff]), { filename: 'cover.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 500 if Cloudinary upload fails', async () => {
        uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

        const mockImageBuffer = Buffer.from('mockImageData');

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBeDefined();
    });
});

describe('DELETE /profile-picture', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should delete profile picture successfully', async () => {
        // Mock userModel.findByIdAndUpdate to return the updated user
        const updatedUser = {
            _id: userId,
            profilePicture: null
        };
        userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const response = await request(app)
            .delete('/profile-picture');

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Profile Picture deleted successfully');
        expect(response.body).not.toHaveProperty('profilePicture'); // No URL returned for deletion
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findByIdAndUpdate to return null (user not found)
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .delete('/profile-picture');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findByIdAndUpdate to throw an error
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/profile-picture');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBe('Database error');
    });
});

describe('DELETE /cover-picture', () => {
    const userId = '0b3169152ee6c171d25e6860'; // Mock user ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should delete cover picture successfully', async () => {
        // Mock userModel.findByIdAndUpdate to return the updated user
        const updatedUser = {
            _id: userId,
            coverPicture: null
        };
        userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const response = await request(app)
            .delete('/cover-picture');

        console.log('Response Body:', response.body); // Debugging: Log the response body

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cover Picture deleted successfully');
        expect(response.body).not.toHaveProperty('coverPicture'); // No URL returned for deletion
    });

    test('should return 404 if user is not found', async () => {
        // Mock userModel.findByIdAndUpdate to return null (user not found)
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .delete('/cover-picture');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 500 if an internal server error occurs', async () => {
        // Mock userModel.findByIdAndUpdate to throw an error
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/cover-picture');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBe('Database error');
    });
});


app.get('/resume', mockVerifyToken, getResume);
app.post('/resume', mockVerifyToken, uploadMiddleware.single('resume'), uploadResume);
app.delete('/resume', mockVerifyToken, deleteResume);

describe('GET /resume', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully retrieve resume URL', async () => {
        const resumeUrl = 'https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can';
    
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: resumeUrl
        };
    
        // Mock the chainable query pattern correctly
        const mockSelectFn = jest.fn().mockResolvedValue(mockUser);
        userModel.findById = jest.fn().mockReturnValue({
            select: mockSelectFn
        });
    
        const response = await request(app).get('/resume');
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Resume retrieved successfully');
        expect(response.body.resume).toBe(resumeUrl);
        expect(response.body.googleDocsUrl).toBe(
            `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`
        );
    });

    test('should return 404 if user not found', async () => {
        // Correctly mock a "user not found" scenario with chainable API
        const mockSelectFn = jest.fn().mockResolvedValue(null);
        userModel.findById = jest.fn().mockReturnValue({
            select: mockSelectFn
        });
    
        const response = await request(app).get('/resume');
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 if resume not uploaded', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: null
        };
    
        // Use the chainable mock pattern
        const mockSelectFn = jest.fn().mockResolvedValue(mockUser);
        userModel.findById = jest.fn().mockReturnValue({
            select: mockSelectFn
        });
    
        const response = await request(app).get('/resume');
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Resume not uploaded');
    });

    test('should return 500 if server error occurs', async () => {
        // Mock the chainable query pattern with an error on select()
        const mockSelectFn = jest.fn().mockRejectedValue(new Error('Database error'));
        userModel.findById = jest.fn().mockReturnValue({
            select: mockSelectFn
        });
    
        const response = await request(app).get('/resume');
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to retrieve resume');
    });
});

describe('POST /resume', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully upload resume', async () => {
        const resumeUrl = 'https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can';
        const mockResumeBuffer = Buffer.from('mock PDF content');

        uploadFile.mockResolvedValue({ url: resumeUrl });

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: resumeUrl
        });

        const response = await request(app)
            .post('/resume')
            .attach('resume', mockResumeBuffer, {
                filename: 'resume.pdf',
                contentType: 'application/pdf'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Resume uploaded successfully');
        expect(response.body.resume).toBe(resumeUrl);
        expect(uploadFile).toHaveBeenCalledWith(expect.any(Buffer), 'raw');
    });

    test('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/resume')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No file uploaded');
    });

    test('should return 400 for invalid file type', async () => {
        const mockImageBuffer = Buffer.from('fake image data');

        const response = await request(app)
            .post('/resume')
            .attach('resume', mockImageBuffer, {
                filename: 'resume.jpg',
                contentType: 'image/jpeg'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
    });

    test('should return 400 if file size exceeds 10MB', async () => {
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB file

        const response = await request(app)
            .post('/resume')
            .attach('resume', largeBuffer, {
                filename: 'large.pdf',
                contentType: 'application/pdf'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('File size too large. Maximum allowed size is 10MB.');
    });

    test('should return 404 if user not found', async () => {
        uploadFile.mockResolvedValue({ url: 'https://example.com/resume.pdf' });
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .post('/resume')
            .attach('resume', Buffer.from('mock PDF content'), {
                filename: 'resume.pdf',
                contentType: 'application/pdf'
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 500 if Cloudinary upload fails', async () => {
        uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

        const response = await request(app)
            .post('/resume')
            .attach('resume', Buffer.from('mock PDF content'), {
                filename: 'resume.pdf',
                contentType: 'application/pdf'
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to upload resume');
    });
});

describe('DELETE /resume', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully delete resume', async () => {
        const resumeUrl = 'https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can';

        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: resumeUrl
        };

        userModel.findById.mockResolvedValue(mockUser);
        deleteFileFromUrl.mockResolvedValue({ result: 'ok' });
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: null
        });

        const response = await request(app).delete('/resume');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Resume deleted successfully');
        expect(deleteFileFromUrl).toHaveBeenCalledWith(resumeUrl);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'cc81c18d6b9fc1b83e2bebe3',
            { resume: null },
            { new: true }
        );
    });

    test('should return 404 if user not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app).delete('/resume');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 400 if no resume to delete', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: null
        };

        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app).delete('/resume');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No resume to delete');
    });

    test('should return 500 if Cloudinary deletion fails', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: 'https://example.com/resume.pdf'
        };

        userModel.findById.mockResolvedValue(mockUser);
        deleteFileFromUrl.mockRejectedValue(new Error('Cloudinary deletion failed'));

        const response = await request(app).delete('/resume');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to delete resume');
    });

    test('should return 500 if Cloudinary reports file not found', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: 'https://example.com/resume.pdf'
        };

        userModel.findById.mockResolvedValue(mockUser);
        deleteFileFromUrl.mockResolvedValue({ result: 'not found' });
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: null
        });

        const response = await request(app).delete('/resume');

        // should throw error if file not found
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to delete resume from storage');
    });

    test('should return 500 if database update fails', async () => {
        const mockUser = {
            _id: 'cc81c18d6b9fc1b83e2bebe3',
            resume: 'https://example.com/resume.pdf'
        };

        userModel.findById.mockResolvedValue(mockUser);
        deleteFileFromUrl.mockResolvedValue({ result: 'ok' });
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));

        const response = await request(app).delete('/resume');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to delete resume');
        expect(response.body.error).toBe('Database update failed');
    });
});

app.patch('/privacy-settings', mockVerifyToken, updatePrivacySettings);

describe('PATCH /privacy-settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update privacy settings', async () => {
        const mockUserId = 'cc81c18d6b9fc1b83e2bebe3';
        const privacySettings = {
            profilePrivacySettings: 'private'
        };

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: mockUserId,
            profilePrivacySettings: 'private'
        });

        const response = await request(app)
            .patch('/privacy-settings')
            .send(privacySettings);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Profile privacy settings updated successfully');
        expect(response.body.profilePrivacySettings).toBe('private');
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUserId,
            { $set: { profilePrivacySettings: 'private' } },
            { new: true, select: 'profilePrivacySettings' }
        );
    });

    test('should return 400 if profilePrivacySettings is missing', async () => {
        const response = await request(app)
            .patch('/privacy-settings')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('profilePrivacySettings is required');
    });

    test('should return 400 if invalid value for profilePrivacySettings is provided', async () => {
        const response = await request(app)
            .patch('/privacy-settings')
            .send({ profilePrivacySettings: 'invalid-value' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid value for profilePrivacySettings. Must be one of: public, private, connectionsOnly');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/privacy-settings')
            .send({ profilePrivacySettings: 'public' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database update fails', async () => {
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/privacy-settings')
            .send({ profilePrivacySettings: 'connectionsOnly' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to update privacy settings');
        expect(response.body.details).toBe('Database error');
    });
});

app.post('/follow/:userId', mockVerifyToken, followEntity);
app.delete('/follow/:userId', mockVerifyToken, unfollowEntity);

describe('POST /follow/:userId - Follow Entity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully follow a user', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: [],
            blockedUsers: [],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock the target user
        const targetUser = {
            _id: targetUserId,
            followers: [],
            blockedUsers: [],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Setup mocks
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(followerUser)  // First call for follower
            .mockResolvedValueOnce(targetUser);   // Second call for target
        
        const response = await request(app)
            .post(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User followed successfully');
        expect(followerUser.following.length).toBe(1);
        expect(followerUser.following[0].entity).toBe(targetUserId);
        expect(followerUser.following[0].entityType).toBe('User');
        expect(targetUser.followers.length).toBe(1);
        expect(targetUser.followers[0].entity).toBe(followerId);
        expect(followerUser.save).toHaveBeenCalled();
        expect(targetUser.save).toHaveBeenCalled();
    });
    
    test('should successfully follow a company', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetCompanyId = 'c18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: [],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock the target company
        const targetCompany = {
            _id: targetCompanyId,
            followers: [],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Setup mocks
        userModel.findById = jest.fn().mockResolvedValue(followerUser);
        companyModel.findById = jest.fn().mockResolvedValue(targetCompany);
        
        const response = await request(app)
            .post(`/follow/${targetCompanyId}`)
            .send({ entityType: 'Company' });
            
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Company followed successfully');
        expect(followerUser.following.length).toBe(1);
        expect(followerUser.following[0].entity).toBe(targetCompanyId);
        expect(followerUser.following[0].entityType).toBe('Company');
        expect(targetCompany.followers.length).toBe(1);
        expect(targetCompany.followers[0].entity).toBe(followerId);
        expect(followerUser.save).toHaveBeenCalled();
        expect(targetCompany.save).toHaveBeenCalled();
    });
    
    test('should return 400 when trying to follow yourself', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';
        
        const response = await request(app)
            .post(`/follow/${userId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You cannot follow yourself');
    });
    
    test('should return 400 for invalid entity type', async () => {
        const targetId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        const response = await request(app)
            .post(`/follow/${targetId}`)
            .send({ entityType: 'InvalidType' });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid entity type. Must be one of: User, Company');
    });
    
    test('should return 400 if already following', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user already following the target
        const followerUser = {
            _id: followerId,
            following: [{
                entity: targetUserId,
                entityType: 'User',
                followedAt: new Date()
            }]
        };
        
        // Setup mock
        userModel.findById = jest.fn().mockResolvedValue(followerUser);
        
        const response = await request(app)
            .post(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You are already following this user');
    });
    
    test('should return 404 if follower user not found', async () => {
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock user not found
        userModel.findById = jest.fn().mockResolvedValue(null);
        
        const response = await request(app)
            .post(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Your user account not found');
    });
    
    test('should return 404 if target entity not found', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: []
        };
        
        // Setup mocks - follower exists but target doesn't
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(followerUser)  // First call for follower
            .mockResolvedValueOnce(null);         // Second call for target
        
        const response = await request(app)
            .post(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    
    test('should return 500 if database error occurs', async () => {
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock database error
        userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        
        const response = await request(app)
            .post(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to follow entity');
    });
});

describe('DELETE /follow/:entityId - Unfollow Entity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully unfollow a user', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: [{
                entity: targetUserId,
                entityType: 'User',
                followedAt: new Date()
            }],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock the target user
        const targetUser = {
            _id: targetUserId,
            followers: [{
                entity: followerId,
                entityType: 'User',
                followedAt: new Date()
            }],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Setup mocks
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(followerUser)  // First call for follower
            .mockResolvedValueOnce(targetUser);   // Second call for target
        
        const response = await request(app)
            .delete(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User unfollowed successfully');
        expect(followerUser.following.length).toBe(0);
        expect(targetUser.followers.length).toBe(0);
        expect(followerUser.save).toHaveBeenCalled();
        expect(targetUser.save).toHaveBeenCalled();
    });
    
    test('should successfully unfollow a company', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetCompanyId = 'c18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: [{
                entity: targetCompanyId,
                entityType: 'Company',
                followedAt: new Date()
            }],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock the target company
        const targetCompany = {
            _id: targetCompanyId,
            followers: [{
                entity: followerId,
                entityType: 'User',
                followedAt: new Date()
            }],
            save: jest.fn().mockResolvedValue(true)
        };
        
        // Setup mocks
        userModel.findById = jest.fn().mockResolvedValue(followerUser);
        companyModel.findById = jest.fn().mockResolvedValue(targetCompany);
        
        const response = await request(app)
            .delete(`/follow/${targetCompanyId}`)
            .send({ entityType: 'Company' });
            
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Company unfollowed successfully');
        expect(followerUser.following.length).toBe(0);
        expect(targetCompany.followers.length).toBe(0);
        expect(followerUser.save).toHaveBeenCalled();
        expect(targetCompany.save).toHaveBeenCalled();
    });
    
    test('should return 400 when trying to unfollow yourself', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';
        
        const response = await request(app)
            .delete(`/follow/${userId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You cannot unfollow yourself');
    });
    
    test('should return 400 if not following the entity', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user not following the target
        const followerUser = {
            _id: followerId,
            following: []
        };
        
        // Mock the target user
        const targetUser = {
            _id: targetUserId,
            followers: []
        };
        
        // Setup mocks
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(followerUser)
            .mockResolvedValueOnce(targetUser);
        
        const response = await request(app)
            .delete(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You are not following this user');
    });
    
    test('should return 404 if target entity not found', async () => {
        const followerId = 'cc81c18d6b9fc1b83e2bebe3';
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock the follower user
        const followerUser = {
            _id: followerId,
            following: [{
                entity: targetUserId,
                entityType: 'User',
                followedAt: new Date()
            }]
        };
        
        // Setup mocks
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(followerUser)
            .mockResolvedValueOnce(null);
        
        const response = await request(app)
            .delete(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    
    test('should return 500 if database error occurs', async () => {
        const targetUserId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        // Mock database error
        userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        
        const response = await request(app)
            .delete(`/follow/${targetUserId}`)
            .send({ entityType: 'User' });
            
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to unfollow entity');
    });
});


// Mock routes for testing
app.get('/user/:userId', mockVerifyToken, getUserProfile);
app.get('/user', mockVerifyToken, getAllUsers);

describe('GET /user/:userId - Get User Profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully retrieve own profile', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';  // Same as authenticated user ID
        
        const mockUser = {
            _id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            profilePrivacySettings: 'private',  // Even if private, own profile should be accessible
            connectionList: [],
            blockedUsers: []
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User profile retrieved successfully');
        expect(response.body.user).toEqual(mockUser);
    });

    test('should successfully retrieve public profile', async () => {
        const userId = 'a18b9c2d3e4f5a6b7c8d9e0f';  // Different from authenticated user
        
        const mockUser = {
            _id: userId,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            profilePrivacySettings: 'public',
            connectionList: [],
            blockedUsers: []
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User profile retrieved successfully');
        expect(response.body.user).toEqual(mockUser);
    });

    test('should return 403 when trying to access private profile', async () => {
        const userId = 'a18b9c2d3e4f5a6b7c8d9e0f';  // Different from authenticated user
        
        const mockUser = {
            _id: userId,
            firstName: 'Jane',
            lastName: 'Smith',
            profilePrivacySettings: 'private',
            connectionList: [],
            blockedUsers: []
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('This profile is private');
    });

    test('should return 403 when trying to access connections-only profile without being connected', async () => {
        const userId = 'a18b9c2d3e4f5a6b7c8d9e0f';  // Different from authenticated user
        
        const mockUser = {
            _id: userId,
            firstName: 'Jane',
            lastName: 'Smith',
            profilePrivacySettings: 'connectionsOnly',
            connectionList: ['e5f6g7h8i9j0'],  // Current user not in connections list
            blockedUsers: []
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('This profile is only visible to connections');
    });

    test('should return 403 when blocked by the user', async () => {
        const userId = 'a18b9c2d3e4f5a6b7c8d9e0f';  // Different from authenticated user
        const authenticatedUserId = 'cc81c18d6b9fc1b83e2bebe3';
        
        const mockUser = {
            _id: userId,
            firstName: 'Jane',
            lastName: 'Smith',
            profilePrivacySettings: 'public',
            connectionList: [],
            blockedUsers: [authenticatedUserId]  // Current user is blocked
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('This profile is not available');
    });

    test('should return 404 when user not found', async () => {
        const userId = 'nonexistentid';
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 500 when server error occurs', async () => {
        const userId = 'a18b9c2d3e4f5a6b7c8d9e0f';
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));
        
        const response = await request(app).get(`/user/${userId}`);
        
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to retrieve user profile');
        expect(response.body.error).toBe('Database error');
    });
});

describe('GET /user - Get All Users', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully retrieve users with no filters', async () => {
        const mockUsers = [
            { _id: '1', firstName: 'John', lastName: 'Doe', profilePrivacySettings: 'public' },
            { _id: '2', firstName: 'Jane', lastName: 'Smith', profilePrivacySettings: 'public' }
        ];
        
        userModel.find = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockUsers)
        }));
        
        userModel.countDocuments = jest.fn().mockResolvedValue(2);
        
        const response = await request(app).get('/user');
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Users retrieved successfully');
        expect(response.body.users).toEqual(mockUsers);
        expect(response.body.pagination).toEqual({
            total: 2,
            page: 1,
            limit: 10,
            pages: 1
        });
    });

    test('should apply name filter', async () => {
        const mockUsers = [
            { _id: '1', firstName: 'John', lastName: 'Doe', profilePrivacySettings: 'public' }
        ];
        
        userModel.find = jest.fn().mockImplementation((filter) => {
            // Verify filter contains name search
            expect(filter.$or).toContainEqual(
                { firstName: { $regex: 'john', $options: 'i' } }
            );
            expect(filter.$or).toContainEqual(
                { lastName: { $regex: 'john', $options: 'i' } }
            );
            
            return {
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            };
        });
        
        userModel.countDocuments = jest.fn().mockResolvedValue(1);
        
        const response = await request(app).get('/user?name=john');
        
        expect(response.status).toBe(200);
        expect(response.body.users).toEqual(mockUsers);
        expect(response.body.pagination.total).toBe(1);
    });

    test('should apply location filter', async () => {
        const mockUsers = [
            { _id: '2', firstName: 'Jane', lastName: 'Smith', location: 'New York', profilePrivacySettings: 'public' }
        ];
        
        userModel.find = jest.fn().mockImplementation((filter) => {
            // Verify filter contains location search
            expect(filter.location).toEqual({ $regex: 'new york', $options: 'i' });
            
            return {
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            };
        });
        
        userModel.countDocuments = jest.fn().mockResolvedValue(1);
        
        const response = await request(app).get('/user?location=new%20york');
        
        expect(response.status).toBe(200);
        expect(response.body.users).toEqual(mockUsers);
    });

    test('should apply industry filter', async () => {
        const mockUsers = [
            { _id: '3', firstName: 'Alex', lastName: 'Johnson', industry: 'Technology', profilePrivacySettings: 'public' }
        ];
        
        userModel.find = jest.fn().mockImplementation((filter) => {
            // Verify filter contains industry search
            expect(filter.industry).toEqual({ $regex: 'technology', $options: 'i' });
            
            return {
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            };
        });
        
        userModel.countDocuments = jest.fn().mockResolvedValue(1);
        
        const response = await request(app).get('/user?industry=technology');
        
        expect(response.status).toBe(200);
        expect(response.body.users).toEqual(mockUsers);
    });

    test('should handle pagination', async () => {
        const mockUsers = [
            { _id: '4', firstName: 'Sarah', lastName: 'Williams', profilePrivacySettings: 'public' }
        ];
        
        userModel.find = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            skip: jest.fn((skipVal) => {
                // Verify skip value is calculated correctly
                expect(skipVal).toBe(20); // (page 3 - 1) * 10
                return {
                    limit: jest.fn((limitVal) => {
                        // Verify limit value is set correctly
                        expect(limitVal).toBe(10);
                        return Promise.resolve(mockUsers);
                    })
                };
            })
        }));
        
        userModel.countDocuments = jest.fn().mockResolvedValue(25);
        
        const response = await request(app).get('/user?page=3&limit=10');
        
        expect(response.status).toBe(200);
        expect(response.body.pagination).toEqual({
            total: 25,
            page: 3,
            limit: 10,
            pages: 3
        });
    });

    test('should return 500 when server error occurs', async () => {
        userModel.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });
        
        const response = await request(app).get('/user');
        
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to retrieve users');
        expect(response.body.error).toBe('Database error');
    });
});
app.patch('/contact-info', mockVerifyToken, editContactInfo);

describe('PATCH /contact-info - Edit Contact Info', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update all contact info fields', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';
        const contactInfoData = {
            phone: '+1234567890',
            phoneType: 'Mobile',
            address: '123 Main St, Anytown, USA',
            birthDay: {
                day: 15,
                month: 'June'
            },
            website: {
                url: 'https://example.com',
                type: 'Personal'
            }
        };
    
        const mockUpdatedUser = {
            _id: userId,
            contactInfo: contactInfoData
        };
    
        // Create mock that supports chained method calls
        const selectMock = jest.fn().mockResolvedValue(mockUpdatedUser);
        userModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            select: selectMock
        });
    
        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Contact information updated successfully');
        expect(response.body.contactInfo).toEqual(contactInfoData);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { 
                $set: {
                    'contactInfo.phone': contactInfoData.phone,
                    'contactInfo.phoneType': contactInfoData.phoneType,
                    'contactInfo.address': contactInfoData.address,
                    'contactInfo.birthDay.day': contactInfoData.birthDay.day,
                    'contactInfo.birthDay.month': contactInfoData.birthDay.month,
                    'contactInfo.website.url': contactInfoData.website.url,
                    'contactInfo.website.type': contactInfoData.website.type
                } 
            },
            { new: true, runValidators: true }
        );
        expect(selectMock).toHaveBeenCalledWith('contactInfo');
    });

    test('should successfully update only provided fields', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';
        const contactInfoData = {
            phone: '+1234567890',
            address: '123 Main St, Anytown, USA'
        };

        const mockUpdatedUser = {
            _id: userId,
            contactInfo: {
                phone: '+1234567890',
                phoneType: 'Mobile',
                address: '123 Main St, Anytown, USA'
            }
        };

        // Create mock that supports chained method calls
        const selectMock = jest.fn().mockResolvedValue(mockUpdatedUser);
        userModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            select: selectMock
        });

        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Contact information updated successfully');
        expect(response.body.contactInfo).toEqual(mockUpdatedUser.contactInfo);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { 
                $set: {
                    'contactInfo.phone': contactInfoData.phone,
                    'contactInfo.address': contactInfoData.address
                } 
            },
            { new: true, runValidators: true }
        );
        expect(selectMock).toHaveBeenCalledWith('contactInfo');
    });

    test('should return 400 for invalid phoneType', async () => {
        const contactInfoData = {
            phoneType: 'Invalid'
        };

        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid phoneType');
        expect(response.body.validValues).toEqual(['Home', 'Work', 'Mobile']);
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid day in birthDay', async () => {
        const contactInfoData = {
            birthDay: {
                day: 32,
                month: 'June'
            }
        };

        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid day value');
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid month in birthDay', async () => {
        const contactInfoData = {
            birthDay: {
                day: 15,
                month: 'InvalidMonth'
            }
        };

        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid month value');
        expect(response.body.validValues).toContain('January');
        expect(response.body.validValues).toContain('December');
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid website type', async () => {
        const contactInfoData = {
            website: {
                url: 'https://example.com',
                type: 'InvalidType'
            }
        };

        const response = await request(app)
            .patch('/contact-info')
            .send(contactInfoData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid website type');
        expect(response.body.validValues).toContain('Personal');
        expect(response.body.validValues).toContain('Portfolio');
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 400 when no fields are provided', async () => {
        const response = await request(app)
            .patch('/contact-info')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No fields provided for update');
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 404 when user not found', async () => {
        // Create mock that supports chained method calls
        const selectMock = jest.fn().mockResolvedValue(null);
        userModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            select: selectMock
        });
    
        const response = await request(app)
            .patch('/contact-info')
            .send({ phone: '+1234567890' });
    
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 when database error occurs', async () => {
        // Create mock that throws error when select is called
        const selectMock = jest.fn().mockRejectedValue(new Error('Database error'));
        userModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            select: selectMock
        });
    
        const response = await request(app)
            .patch('/contact-info')
            .send({ phone: '+1234567890' });
    
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to update contact information');
        expect(response.body.details).toBe('Database error');
    });
});

app.get('/me', mockVerifyToken, getMe);

describe('GET /me - Get Current User Profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully retrieve own profile', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';  // Same as authenticated user ID
        
        const mockUser = {
            _id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            profilePrivacySettings: 'private',  // Even if private, own profile should be accessible
            connectionList: [],
            blockedUsers: []
        };
        
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockUser)
        }));
        
        const response = await request(app).get('/me');
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User profile retrieved successfully');
        expect(response.body.user).toEqual(mockUser);
    });

    test('should exclude sensitive fields from response', async () => {
        const userId = 'cc81c18d6b9fc1b83e2bebe3';
        
        // Complete user with sensitive fields
        const completeUser = {
            _id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password_here',
            resetPasswordToken: 'some_token',
            resetPasswordTokenExpiry: new Date(),
            verificationToken: 'verification_token',
            refreshToken: 'refresh_token',
            profilePrivacySettings: 'public',
            connectionList: [],
            blockedUsers: []
        };
        
        // Expected response after sensitive fields are filtered
        const filteredUser = {
            _id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            profilePrivacySettings: 'public',
            connectionList: [],
            blockedUsers: []
        };
        
        // Mock the select function to filter out sensitive fields
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(filteredUser)
        }));
        
        const response = await request(app).get('/me');
        
        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).not.toHaveProperty('resetPasswordToken');
        expect(response.body.user).not.toHaveProperty('resetPasswordTokenExpiry');
        expect(response.body.user).not.toHaveProperty('verificationToken');
        expect(response.body.user).not.toHaveProperty('refreshToken');
    });

    test('should return 404 when user not found', async () => {
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));
        
        const response = await request(app).get('/me');
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    test('should return 500 when server error occurs', async () => {
        userModel.findById = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Database error'))
        }));
        
        const response = await request(app).get('/me');
        
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to retrieve user profile');
        expect(response.body.error).toBe('Database error');
    });
});

describe('Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user/search', () => {
    test('should search users by name successfully', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', industry: 'Tech' },
        { firstName: 'Jane', lastName: 'Smith', industry: 'Finance' }
      ];

      userModel.find = jest.fn().mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/user/search?query=john')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(mockUsers);
    });

    test('should search users by company successfully', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', company: 'Google' }
      ];

      userModel.find = jest.fn().mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/user/search?company=Google')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(mockUsers);
    });

    test('should search users by industry successfully', async () => {
      const mockUsers = [
        { firstName: 'John', lastName: 'Doe', industry: 'Technology' }
      ];

      userModel.find = jest.fn().mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/user/search?industry=Technology')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(mockUsers);
    });
  });
});

describe('Connection Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /user/connections/request/:targetUserId', () => {
    test('should send connection request successfully', async () => {
      const mockUser = {
        _id: 'userId',
        sentConnectionRequests: [],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockTargetUser = {
        _id: 'targetId',
        receivedConnectionRequests: [],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTargetUser);

      const response = await request(app)
        .post('/user/connections/request/targetId')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Connection request sent successfully');
    });
  });

  describe('PATCH /user/connections/requests/:senderId', () => {
    test('should accept connection request successfully', async () => {
      const mockUser = {
        _id: 'userId',
        receivedConnectionRequests: ['senderId'],
        connectionList: [],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockSender = {
        _id: 'senderId',
        sentConnectionRequests: ['userId'],
        connectionList: [],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockSender);

      const response = await request(app)
        .patch('/user/connections/requests/senderId')
        .send({ action: 'accept' })
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Connection request accepted');
    });

    test('should decline connection request successfully', async () => {
      const mockUser = {
        _id: 'userId',
        receivedConnectionRequests: ['senderId'],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/user/connections/requests/senderId')
        .send({ action: 'decline' })
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Connection request declined');
    });
  });

  describe('DELETE /user/connections/:connectionId', () => {
    test('should remove connection successfully', async () => {
      const mockUser = {
        _id: 'userId',
        connectionList: ['connectionId'],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockConnection = {
        _id: 'connectionId',
        connectionList: ['userId'],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockConnection);

      const response = await request(app)
        .delete('/user/connections/connectionId')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Connection removed successfully');
    });
  });
});

describe('Following Management', () => {
  // Your existing follow/unfollow tests can be moved here
  // Add any additional tests needed
});

describe('Blocking Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /user/block/:userId', () => {
    test('should block user successfully', async () => {
      const mockUser = {
        _id: 'userId',
        blockedUsers: [],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/user/block/targetId')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User blocked successfully');
    });
  });

  describe('GET /user/blocked', () => {
    test('should get list of blocked users', async () => {
      const mockBlockedUsers = [
        { _id: 'user1', firstName: 'John' },
        { _id: 'user2', firstName: 'Jane' }
      ];

      userModel.findById = jest.fn().mockResolvedValue({
        blockedUsers: ['user1', 'user2']
      });

      userModel.find = jest.fn().mockResolvedValue(mockBlockedUsers);

      const response = await request(app)
        .get('/user/blocked')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.blockedUsers).toEqual(mockBlockedUsers);
    });
  });
});

describe('Message Requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /user/message-requests', () => {
    test('should send message request successfully', async () => {
      const mockUser = {
        _id: 'userId',
        messageRequests: [],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/user/message-requests')
        .send({ targetUserId: 'targetId' })
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message request sent successfully');
    });
  });

  describe('PATCH /user/message-requests/:requestId', () => {
    test('should accept message request successfully', async () => {
      const mockUser = {
        _id: 'userId',
        messageRequests: ['requestId'],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/user/message-requests/requestId')
        .send({ action: 'accept' })
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message request accepted');
    });
  });
});
