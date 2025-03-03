const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { 
    userIds, postIds, commentIds, repostIds, companyIds, 
    impressionIds, notificationIds, subscriptionIds, transactionIds,jobIds 
} = require('./init');

const users = [];

async function createRandomUsers() {
    for (let i = 0; i < userIds.length; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10); // Default password

        const workExperience = Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
            jobTitle: faker.person.jobTitle(),
            companyName: faker.company.name(),
            fromDate: faker.date.past({ years: faker.number.int({ min: 1, max: 10 }) }),
            toDate: faker.datatype.boolean() ? faker.date.recent({ days: 200 }) : null,
            employmentType: faker.helpers.arrayElement(["Full Time", "Part Time", "Freelance", "Self Employed", "Contract", "Internship", "Apprenticeship", "Seasonal"]),
            location: faker.location.city(),
            locationType: faker.helpers.arrayElement(["Onsite", "Hybrid", "Remote"]),
            description: faker.lorem.sentence(),
            foundVia: faker.helpers.arrayElement(["Indeed", "LinkedIn", "Company Website", "Other job sites", "Referral", "Contracted by Recruiter", "Staffing Agency", "Other"]),
            skills: faker.helpers.arrayElements(["JavaScript", "Python", "SQL", "AWS", "Docker"], faker.number.int({ min: 1, max: 4 })),
            media: faker.image.url(),
        }));

        const education = Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => ({
            school: faker.company.name(),
            degree: faker.helpers.arrayElement(["BSc", "MSc", "PhD", "Diploma"]),
            fieldOfStudy: faker.helpers.arrayElement(["Computer Science", "Business", "Marketing", "Engineering"]),
            startDate: faker.date.past({ years: faker.number.int({ min: 4, max: 10 }) }),
            endDate: faker.datatype.boolean() ? faker.date.past({ years: faker.number.int({ min: 1, max: 3 }) }) : null,
            grade: faker.helpers.arrayElement(["A", "B", "C", "Pass"]),
            activities: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            skills: faker.helpers.arrayElements(["Machine Learning", "Networking", "Finance", "Cybersecurity"], faker.number.int({ min: 1, max: 3 })),
            media: faker.image.url(),
        }));

        const skills = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
            skillName: faker.helpers.arrayElement(["React", "Node.js", "MongoDB", "Kubernetes", "UI/UX Design"]),
            endorsements: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 3 }))
        }));

        users.push({
            _id: userIds[i],
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: hashedPassword,
            profilePicture: faker.image.avatar(),
            coverPicture: faker.image.url(),
            resume: faker.datatype.boolean() ? faker.internet.url() : null,
            bio: faker.lorem.sentence(),
            location: faker.location.city(),
            lastJobTitle: faker.person.jobTitle(),

            workExperience: workExperience,
            education: education,
            skills: skills,

            transactions: faker.helpers.arrayElements(transactionIds, faker.number.int({ min: 0, max: 2 })),
            subscription: faker.helpers.arrayElement(subscriptionIds),
            isPremium: faker.datatype.boolean(),

            companies: faker.helpers.arrayElements(companyIds, faker.number.int({ min: 0, max: 3 })),
            adminInCompanies: faker.helpers.arrayElements(companyIds, faker.number.int({ min: 0, max: 2 })),
            isSuperAdmin: faker.datatype.boolean(),

            profilePrivacySettings: faker.helpers.arrayElement(["public", "private", "connectionsOnly"]),
            connectionRequestPrivacySetting: faker.helpers.arrayElement(["everyone", "connectionsOnly"]),

            impressions: faker.helpers.arrayElements(impressionIds, faker.number.int({ min: 0, max: 5 })),
            posts: faker.helpers.arrayElements(postIds, faker.number.int({ min: 0, max: 4 })),
            comments: faker.helpers.arrayElements(commentIds, faker.number.int({ min: 0, max: 3 })),
            reposts: faker.helpers.arrayElements(repostIds, faker.number.int({ min: 0, max: 2 })),

            following: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 10 })),
            followers: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 10 })),
            connectionList: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 8 })),
            blockedUsers: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 2 })),
            profileViews: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 5 })),

            savedPosts: faker.helpers.arrayElements(postIds, faker.number.int({ min: 0, max: 4 })),
            savedJobs: faker.helpers.arrayElements(jobIds, faker.number.int({ min: 0, max: 3 })),
            appliedJobs: faker.helpers.arrayElements(jobIds, faker.number.int({ min: 0, max: 2 }))
            .map(jobId => ({
                jobId: jobId,
                status: faker.helpers.arrayElement(["pending", "viewed", "rejected", "accepted"])
            })),

            sentConnectionRequests: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 3 })),
            receivedConnectionRequests: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 3 })),
            messageRequests: faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: 2 })),

            defaultMode: faker.helpers.arrayElement(["light", "dark"]),
            googleId: faker.datatype.boolean() ? faker.string.uuid() : null,
            fcmToken: faker.string.uuid(),

            emailVerificationToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            emailVerificationExpiresAt: faker.datatype.boolean() ? faker.date.future() : null,
            passwordResetToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            passwordResetExpiresAt: faker.datatype.boolean() ? faker.date.future() : null,
            certificates: faker.image.url(),
            isActive: faker.datatype.boolean(),
            createdAt: faker.date.past({ years: 2 }),
            updatedAt: faker.date.recent(),
        });
    }
}

async function userSeeder() {
    try {
        await createRandomUsers();
        console.log(`Generated ${users.length} users`);

        const deleteResult = await UserModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} users`);

        const insertResult = await UserModel.insertMany(users);
        console.log(`Inserted ${insertResult.length} users`);
        console.log('Sample user:', insertResult[0]);
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

module.exports = userSeeder;
