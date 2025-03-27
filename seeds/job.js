const { faker } = require('@faker-js/faker');
const JobModel = require('../models/jobModel');
const CompanyModel = require('../models/companyModel');
const { 
    userIds, companyIds, jobIds 
} = require('./init');

const jobs = [];

async function createRandomJobs() {
    // Job locations for more realistic data
    const jobLocations = [
        'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL',
        'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA',
        'Miami, FL', 'Washington, DC', 'Dallas, TX', 'Philadelphia, PA',
        'Phoenix, AZ', 'Toronto, Canada', 'London, UK', 'Berlin, Germany',
        'Paris, France', 'Sydney, Australia', 'Tokyo, Japan', 'Remote'
    ];

    // Job title templates for more realistic data
    const jobTitlePrefixes = [
        'Senior', 'Junior', 'Lead', 'Associate', 'Principal', 'Entry-Level',
        'Contract', 'Freelance', 'Part-Time', 'Full-Time'
    ];
    
    const jobRoles = [
        'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist',
        'Marketing Manager', 'Sales Representative', 'Financial Analyst',
        'HR Specialist', 'Customer Support', 'Project Manager',
        'Business Analyst', 'DevOps Engineer', 'Content Writer',
        'Graphic Designer', 'Operations Manager'
    ];

    for (let i = 0; i < jobIds.length; i++) {
        const jobId = jobIds[i];
        
        // Each job belongs to a random company
        const companyId = faker.helpers.arrayElement(companyIds);
        
        // Generate applicants (0-15 applicants per job)
        const applicantsCount = faker.number.int({ min: 0, max: 15 });
        const applicants = faker.helpers.arrayElements(userIds, applicantsCount);
        
        // Some applicants get accepted, some get rejected
        const acceptedCount = faker.number.int({ min: 0, max: Math.floor(applicants.length * 0.3) });
        const accepted = faker.helpers.arrayElements(applicants, acceptedCount);
        
        const rejectedCount = faker.number.int({ min: 0, max: applicants.length - acceptedCount });
        const rejected = faker.helpers.arrayElements(
            applicants.filter(id => !accepted.includes(id)),
            rejectedCount
        );
        
        // Create screening questions (0-5 questions)
        const questionCount = faker.number.int({ min: 0, max: 5 });
        const screeningQuestions = Array.from({ length: questionCount }, () => ({
            question: faker.helpers.arrayElement([
                'Do you have experience with React?',
                'Are you familiar with AWS services?',
                'Do you have a Bachelor\'s degree or higher?',
                'Are you authorized to work in this country?',
                'Do you have experience managing teams?',
                'Are you willing to relocate?',
                'Can you work weekends occasionally?',
                'Do you have experience with agile development?',
                'Are you proficient in SQL?',
                'Do you have experience in the healthcare industry?'
            ]),
            mustHave: faker.datatype.boolean(0.3) // 30% chance of being a must-have
        }));

        // Generate job title
        const usePrefix = faker.datatype.boolean(0.7); // 70% chance to use a prefix
        const jobTitle = usePrefix 
            ? `${faker.helpers.arrayElement(jobTitlePrefixes)} ${faker.helpers.arrayElement(jobRoles)}`
            : faker.helpers.arrayElement(jobRoles);
            
        // Generate job description with structured sections
        const jobDescription = `
# ${jobTitle}

## About the Role
${faker.lorem.paragraphs({ min: 2, max: 3 }, '<br><br>')}

## Responsibilities
${Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => '- ' + faker.lorem.sentence()).join('<br>')}

## Requirements
${Array.from({ length: faker.number.int({ min: 4, max: 8 }) }, () => '- ' + faker.lorem.sentence()).join('<br>')}

## Benefits
${Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => '- ' + faker.helpers.arrayElement([
    'Competitive salary',
    'Health, dental, and vision insurance',
    'Flexible work hours',
    'Remote work options',
    '401(k) matching',
    'Paid time off',
    'Professional development allowance',
    'Gym membership',
    'Catered lunches',
    'Company retreats',
    'Stock options',
    'Parental leave',
    'Mental health benefits'
])).join('<br>')}

## About Us
${faker.lorem.paragraph()}
`;
        
        jobs.push({
            _id: jobId,
            title: jobTitle,
            companyId,
            workplaceType: faker.helpers.arrayElement(["Onsite", "Hybrid", "Remote"]),
            jobLocation: faker.helpers.arrayElement(jobLocations),
            jobType: faker.helpers.arrayElement([
                "Full Time", "Part Time", "Contract", "Temporary", 
                "Other", "Volunteer", "Internship"
            ]),
            description: jobDescription,
            applicationEmail: faker.internet.email(),
            screeningQuestions,
            autoRejectMustHave: faker.datatype.boolean(0.5), // 50% chance
            rejectPreview: faker.datatype.boolean(0.7) // 70% chance
                ? `Thank you for your interest in the ${jobTitle} position, but we've decided to pursue other candidates who better match our requirements.`
                : null,
            applicants,
            accepted,
            rejected,
            salary: faker.datatype.boolean(0.7) // 70% chance to include salary
                ? {
                    min: faker.number.int({ min: 30000, max: 80000 }),
                    max: faker.number.int({ min: 80001, max: 200000 }),
                    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'CAD'])
                }
                : undefined,
            skills: faker.helpers.arrayElements(
                ['JavaScript', 'React', 'Python', 'Java', 'C#', 'Node.js', 'AWS', 'Docker',
                'Kubernetes', 'SQL', 'MongoDB', 'GraphQL', 'React Native', 'Swift', 'Kotlin',
                'PHP', 'Ruby', 'Go', 'TypeScript', 'Machine Learning', 'Data Analysis',
                'Project Management', 'Sales', 'Marketing', 'UX/UI Design', 'Product Management'],
                faker.number.int({ min: 3, max: 8 })
            ),
            experienceLevel: faker.helpers.arrayElement([
                'Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'
            ]),
            createdAt: faker.date.past({ months: 3 }),
            updatedAt: faker.date.recent()
        });
    }
}

// Update company documents to link them with jobs
async function updateCompanyJobRelationships() {
    // Group jobs by company
    const companyJobsMap = new Map();
    
    jobs.forEach(job => {
        const companyId = job.companyId.toString();
        if (!companyJobsMap.has(companyId)) {
            companyJobsMap.set(companyId, []);
        }
        companyJobsMap.get(companyId).push(job._id);
    });
    
    // Update each company with its jobs
    for (const [companyId, companyJobs] of companyJobsMap.entries()) {
        await CompanyModel.findByIdAndUpdate(companyId, {
            $push: { jobs: { $each: companyJobs } }
        });
    }
}

async function jobSeeder() {
    try {
        await createRandomJobs();

        const deleteResult = await JobModel.deleteMany({});

        const insertResult = await JobModel.insertMany(jobs);

        await updateCompanyJobRelationships();

        // Verify a sample job
        const sampleJob = await JobModel.findById(jobIds[0]);
        
        // Verify a sample company's job relationships
        const companyWithJobs = await CompanyModel.findById(jobs[0].companyId);
        console.log('Sample company job relationships:', {
            companyName: companyWithJobs.name,
            jobsCount: companyWithJobs.jobs?.length || 0
        });
    } catch (error) {
        console.error('Error seeding jobs:', error);
    }
}

module.exports = jobSeeder;