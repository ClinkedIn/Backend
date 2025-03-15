/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require('supertest');
const express = require('express');
const userModel = require('../models/userModel');
const companyModel = require('../models/companyModel');
const {
    addEducation,
    getEducation,
    editEducation,
    getEducations,
    deleteEducation,
    editIntro, addExperience,
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
    updatePrivacySettings,
    followEntity,
    unfollowEntity,
    getUserProfile,
    getAllUsers,
    deleteSkill
} = require('../controllers/userProfileController');
const { uploadFile, uploadMultipleImages, deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const uploadMiddleware = require('../middlewares/multer');

jest.mock('../utils/userProfileUtils', () => ({
    validateSkillName: jest.requireActual('../utils/userProfileUtils').validateSkillName,
    validateEndorsements: jest.requireActual('../utils/userProfileUtils').validateEndorsements,
    sortWorkExperience: jest.requireActual('../utils/userProfileUtils').sortWorkExperience
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
            education: [mockEducationData]
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
            bio: 'Software Engineer',
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
            bio: mockIntroData.bio,
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
        expect(response.body.missingFields).toContain('bio');
        expect(response.body.missingFields).toContain('location');
        expect(response.body.missingFields).toContain('industry');
        expect(response.body.missingFields).toContain('mainEducation');
    });

    test('should return 404 if user not found', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Software Engineer',
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
            bio: 'Software Engineer',
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


app.post('/experience', mockVerifyToken, addExperience);
app.put('/experience/:index', mockVerifyToken, updateExperience);
app.get('/experience', mockVerifyToken, getAllExperiences)

describe('POST /experience', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully add experience', async () => {
        const mockExperienceData = {
            jobTitle: 'SWE',
            companyName: 'Microsoft',
            fromDate: '2018-09-01',
            toDate: '2023-09-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Egypt',
            locationType: 'Onsite',
            description: 'Senior SWE',
            foundVia: 'LinkedIn',
            skills: ['Problem Solving'],
            media: 'media'
        };

        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [],
            save: jest.fn().mockResolvedValue(true),
        };

        userModel.findById = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/experience')
            .send(mockExperienceData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');
        expect(response.body.experience).toEqual(expect.objectContaining(mockExperienceData));
        expect(response.body.sortedWorkExperience).toHaveLength(1);
    });

    test('should sort work experience in reverse chronological order', async () => {
        const experiences = [
            {
                jobTitle: 'Junior Developer',
                companyName: 'Small Company',
                fromDate: '2015-01-01',
                toDate: '2017-12-31',
                currentlyWorking: false,
                employmentType: 'Full Time',
                location: 'Remote',
                locationType: 'Remote',
                description: 'Junior role',
                foundVia: 'Referral',
                skills: ['HTML', 'CSS'],
                media: ''
            },
            {
                jobTitle: 'Senior SWE',
                companyName: 'Google',
                fromDate: '2022-10-01',
                toDate: '2025-12-01',
                currentlyWorking: false,
                employmentType: 'Full Time',
                location: 'USA',
                locationType: 'Hybrid',
                description: 'Leading projects',
                foundVia: 'Direct',
                skills: ['System Design', 'Leadership'],
                media: ''
            },
            {
                jobTitle: 'SWE',
                companyName: 'Microsoft',
                fromDate: '2023-01-01',
                toDate: '2023-09-01',
                currentlyWorking: false,
                employmentType: 'Full Time',
                location: 'Egypt',
                locationType: 'Onsite',
                description: 'Senior SWE',
                foundVia: 'LinkedIn',
                skills: ['Problem Solving'],
                media: 'media'
            }
        ];

        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [experiences[0]],
            save: jest.fn().mockResolvedValue(true),
        };

        userModel.findById = jest.fn()
            .mockResolvedValueOnce(mockUser) // First call (adding second experience)
            .mockResolvedValueOnce({ ...mockUser, workExperience: [...mockUser.workExperience, experiences[1]] }) // Second call (adding third experience)
            .mockResolvedValueOnce({ ...mockUser, workExperience: [...mockUser.workExperience, experiences[1], experiences[2]] });

        await request(app).post('/experience').send(experiences[1]);
        const response = await request(app).post('/experience').send(experiences[2]);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');

        const sortedExperience = response.body.sortedWorkExperience.map(exp => exp.companyName);
        expect(sortedExperience).toEqual(['Google', 'Microsoft', 'Small Company']);
    });

    test('should return 400 if required fields are missing', async () => {
        const incompleteExperience = {
            jobTitle: 'Software Engineer',
            companyName: '',
            fromDate: '2020-01-01'
        };

        const response = await request(app)
            .post('/experience')
            .send(incompleteExperience);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Company Name is required');
    });

    test('should return 400 if end date is missing and currentlyWorking is false', async () => {
        const experienceWithNoEndDate = {
            jobTitle: 'Software Engineer',
            companyName: 'Amazon',
            fromDate: '2020-01-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'USA',
            locationType: 'Hybrid',
            description: 'Working at Amazon',
            foundVia: 'LinkedIn',
            skills: ['AWS', 'Java'],
            media: ''
        };

        const response = await request(app)
            .post('/experience')
            .send(experienceWithNoEndDate);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('End Date is required');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById = jest.fn().mockResolvedValue(null);

        const experience = {
            jobTitle: 'SWE',
            companyName: 'Microsoft',
            fromDate: '2018-09-01',
            toDate: '2023-09-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Egypt',
            locationType: 'Onsite',
            description: 'Senior SWE',
            foundVia: 'LinkedIn',
            skills: ['Problem Solving'],
            media: 'media'
        };

        const response = await request(app)
            .post('/experience')
            .send(experience);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database error occurs', async () => {
        userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const experience = {
            jobTitle: 'SWE',
            companyName: 'Microsoft',
            fromDate: '2018-09-01',
            toDate: '2023-09-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Egypt',
            locationType: 'Onsite',
            description: 'Senior SWE',
            foundVia: 'LinkedIn',
            skills: ['Problem Solving'],
            media: 'media'
        };

        const response = await request(app)
            .post('/experience')
            .send(experience);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add experience');
    });
});


describe('GET /experience - Get User Experiences', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    // beforeEach(() => {
    //userId = new mongoose.Types.ObjectId();
    // });

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
        const sortedJobTitles = response.body.experience.map(exp => exp.jobTitle);
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
        expect(response.body.error).toBe('Invalid Start Date');
    });

    test('should return 400 if toDate is invalid', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/0')
            .send({ toDate: 'invalid-date' }); // Invalid date

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid End Date');
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


/*
Skills Section Tests
*/ 


app.post('/skills', mockVerifyToken, addSkill);
app.put('/skills/:skillName', mockVerifyToken, updateSkill);
app.delete('/skills/:skillName', mockVerifyToken, deleteSkill);

describe('POST /skills', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a skill successfully', async () => {
        const mockUserId = '0b3169152ee6c171d25e6860';
        const mockSkillData = {
            skillName: 'Problem Solving',
            educationIndexes: [0],
        };

        const mockUser = {
            _id: mockUserId,
            education: [{}], // Mocking one education entry
            skills: []
        };

        const mockUpdatedUser = {
            _id: mockUserId,
            skills: [{ skillName: 'Problem Solving', education: [0], endorsements: [] }]
        };

        userModel.exists.mockResolvedValue(false); // Skill does not exist
        userModel.findById.mockResolvedValue(mockUser); // User found
        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser); // Simulating skill addition

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill added successfully');
        expect(response.body.skill).toEqual({
            skillName: 'Problem Solving',
            education: [0],
            endorsements: []
        });
    });

    test('should return 400 if skill already exists', async () => {
        userModel.exists.mockResolvedValue(true); // Skill exists

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Problem Solving', educationIndexes: [0] });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill already exists');
    });

    test('should return 400 if skill name is invalid', async () => {
        const response = await request(app)
            .post('/skills')
            .send({ skillName: '', educationIndexes: [0] });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid skill name'); // Assuming validateSkillName() returns this
    });

    test('should return 400 if educationIndexes is not an array', async () => {
        userModel.exists.mockResolvedValue(false);
        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: "notAnArray" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Education indexes must be an array');
    });

    test('should return 400 if educationIndexes contains invalid indexes', async () => {
        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            education: [{}] // Only one valid index (0)
        };

        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: [0, 5] }); // Index 5 is out of bounds

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some provided education indexes are invalid');
    });

    test('should return 404 if user is not found', async () => {
        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(null); // Simulating a missing user

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: [] });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database update fails', async () => {
        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            education: [{}]
        };

        userModel.exists.mockResolvedValue(false);
        userModel.findById.mockResolvedValue(mockUser);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', educationIndexes: [0] });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

describe('PUT /skills/:skillName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if no updates are provided', async () => {
        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No updates provided');
    });

    test('should return 400 if new skill name is the same as the current one', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [] }],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Problem Solving' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill name is the same');
    });

    test('should return 400 if new skill name is invalid', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [] }],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: '!' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid skill name');
    });

    test('should return 400 if new skill name already exists in user profile', async () => {
        userModel.findById.mockResolvedValue({
            skills: [
                { skillName: 'Problem Solving', education: [] },
                { skillName: 'Critical Thinking', education: [] },
            ],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill already exists');
    });

    test('should return 400 if education indexes contain invalid values', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: ['Degree 1', 'Degree 2'],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ educationIndexes: [0, 5] }); // Invalid index 5

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some provided education indexes are invalid');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 404 if skill is not found', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Critical Thinking', education: [] }],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Creative Thinking' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    test('should update skill name successfully', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [] }],
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [{ skillName: 'Critical Thinking', education: [] }],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill updated successfully');
        expect(response.body.skill.skillName).toBe('Critical Thinking');
    });

    test('should update skill education indexes successfully', async () => {
        userModel.findById.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [] }],
            education: ['Degree 1', 'Degree 2', 'Degree 3'],
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving', education: [0, 2] }],
        });

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ educationIndexes: [0, 2] });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill updated successfully');
        expect(response.body.skill.education).toEqual([0, 2]);
    });

    test('should return 500 if an internal server error occurs', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/skills/Problem Solving')
            .send({ newSkillName: 'Critical Thinking' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

/*
describe('DELETE /skills/:skillName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 404 if skill is not found', async () => {
        userModel.findOne.mockResolvedValue(null);

        const response = await request(app)
            .delete('/skills/Problem Solving');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findOne.mockResolvedValue({
            skills: [{ skillName: 'Problem Solving' }]
        });

        userModel.findByIdAndUpdate.mockResolvedValue(null); // Simulating user not found

        const response = await request(app)
            .delete('/skills/Problem Solving');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should delete skill successfully', async () => {
        const skillToDelete = { skillName: 'Problem Solving' };

        userModel.findOne.mockResolvedValue({
            skills: [skillToDelete],
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            skills: [],
        });

        const response = await request(app)
            .delete('/skills/Problem Solving');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill deleted successfully');
        expect(response.body.deletedSkill).toEqual(skillToDelete);
    });

    test('should return 500 if an internal server error occurs', async () => {
        userModel.findOne.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/skills/Problem Solving');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});
*/
   
/*

describe('POST /user/skills/add-endorsement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should endorse a skill successfully', async () => {
        const mockUserId = 'd29ccbd4ac1b1cb9faefb867';
        const mockSkillData = { skillName: 'JavaScript' };
        const mockEndorserId = '0b3169152ee6c171d25e6860';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'JavaScript', endorsements: [] }]
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'JavaScript', endorsements: [mockEndorserId] }]
        });

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: mockUserId, skillName: 'JavaScript' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill endorsement created successfully');
        expect(response.body.skill.skillName).toBe('JavaScript');
        expect(response.body.skill.endorsements).toContain(mockEndorserId);
    });

    it('should return 400 if user tries to endorse their own skill', async () => {
        const mockUserId = 'd29ccbd4ac1b1cb9faefb867';

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: mockUserId, skillName: 'JavaScript' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('You cannot endorse your own skill');
    });

    it('should return 400 if the skill is already endorsed', async () => {
        userModel.findById.mockResolvedValue({
            _id: 'd29ccbd4ac1b1cb9faefb867',
            skills: [{ skillName: 'JavaScript', endorsements: ['USER_ID_1'] }]
        });

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: '0b3169152ee6c171d25e6860', skillName: 'JavaScript' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill already endorsed');
    });

    it('should return 404 if the user is not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: 'invalid_id', skillName: 'JavaScript' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    it('should return 404 if the skill is not found', async () => {
        userModel.findById.mockResolvedValue({
            _id: '0b3169152ee6c171d25e6860',
            skills: []
        });

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: '0b3169152ee6c171d25e6860', skillName: 'JavaScript' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    it('should return 500 if an internal server error occurs', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/user/skills/add-endorsement')
            .send({ skillOwnerId: '0b3169152ee6c171d25e6860', skillName: 'JavaScript' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

describe('DELETE /user/skills/remove-endorsement/:skillName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should remove an endorsement successfully', async () => {
        const mockUserId = '64f8a1b2c3d4e5f6a7b8c9d0';
        const skillName = 'JavaScript';

        userModel.findById.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'JavaScript', endorsements: ['USER_ID_1', 'USER_ID_2'] }]
        });

        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: mockUserId,
            skills: [{ skillName: 'JavaScript', endorsements: ['USER_ID_2'] }]
        });

        const response = await request(app)
            .delete(`/user/skills/remove-endorsement/${skillName}`)
            .send({ skillOwnerId: mockUserId });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill endorsement deleted successfully');
        expect(response.body.skill.skillName).toBe(skillName);
        expect(response.body.skill.endorsements).not.toContain('USER_ID_1');
    });

    it('should return 400 if skill name is missing', async () => {
        const response = await request(app)
            .delete('/user/skills/remove-endorsement/')
            .send({ skillOwnerId: '64f8a1b2c3d4e5f6a7b8c9d0' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill name is required');
    });

    it('should return 404 if the user is not found', async () => {
        userModel.findById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/user/skills/remove-endorsement/JavaScript')
            .send({ skillOwnerId: 'invalid_id' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    it('should return 404 if the skill is not found', async () => {
        userModel.findById.mockResolvedValue({
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            skills: []
        });

        const response = await request(app)
            .delete('/user/skills/remove-endorsement/JavaScript')
            .send({ skillOwnerId: '64f8a1b2c3d4e5f6a7b8c9d0' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Skill not found');
    });

    it('should return 400 if the endorsement does not exist', async () => {
        userModel.findById.mockResolvedValue({
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            skills: [{ skillName: 'JavaScript', endorsements: [] }]
        });

        const response = await request(app)
            .delete('/user/skills/remove-endorsement/JavaScript')
            .send({ skillOwnerId: '64f8a1b2c3d4e5f6a7b8c9d0' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Endorsement not found');
    });

    it('should return 500 if an internal server error occurs', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/user/skills/remove-endorsement/JavaScript')
            .send({ skillOwnerId: '64f8a1b2c3d4e5f6a7b8c9d0' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});

*/

/*
Profile and Cover Pictures Tests
*/

app.post('/add-profile-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadProfilePicture);
app.post('/add-cover-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadCoverPicture);

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