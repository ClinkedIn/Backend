const request = require('supertest');
const express = require('express');
const userModel = require('../../models/userModel'); // Adjust path as needed
const user = require('../../controllers/userController'); // Adjust path as needed
const mockVerifyToken = require('../../middlewares/mockVerifyToken'); // Adjust path as needed

jest.mock('../../models/userModel'); // Mock userModel

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.patch('/education', mockVerifyToken, user.addEducation); // Attach route

describe('PATCH /education', () => {
    const mockUserId = '64d4f3dbe2781e1234567890';

    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
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
            _id: mockUserId,
            education: [mockEducationData] // Last item is the added education
        };

        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        const response = await request(app)
            .patch('/education')
            .set('Authorization', 'Bearer mock-token') // Simulate auth
            .send(mockEducationData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education added successfully');
        expect(response.body.education).toEqual(mockEducationData);
    });

    test('should return 400 if school name is missing', async () => {
        const response = await request(app)
            .patch('/education')
            .set('Authorization', 'Bearer mock-token')
            .send({ degree: 'B.Sc. Computer Science' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/education')
            .set('Authorization', 'Bearer mock-token')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 on server error', async () => {
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .patch('/education')
            .set('Authorization', 'Bearer mock-token')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add education');
        expect(response.body.details).toBe('Database failure');
    });
});
