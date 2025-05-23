const { faker } = require('@faker-js/faker');
const JobModel = require('../models/jobModel');
const CompanyModel = require('../models/companyModel');
const { 
    userIds, companyIds, jobIds 
} = require('./init');

const jobs = [];

// Cache for company industries to avoid repeated database calls
const companyIndustryCache = new Map();

// Helper function to get company industry
async function getCompanyIndustry(companyId) {
    // Check cache first
    const cachedIndustry = companyIndustryCache.get(companyId.toString());
    if (cachedIndustry) return cachedIndustry;
    
    // If not in cache, fetch from database
    try {
        const company = await CompanyModel.findById(companyId).select('industry');
        if (company && company.industry) {
            // Store in cache for future use
            companyIndustryCache.set(companyId.toString(), company.industry);
            return company.industry;
        }
    } catch (err) {
        console.error(`Error fetching industry for company ${companyId}:`, err);
    }
    
    // Fallback to a random industry
    const randomIndustry = faker.helpers.arrayElement([
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Media & Entertainment', 'Hospitality', 'Construction',
        'Transportation', 'Agriculture', 'Energy', 'Professional Services',
        'Real Estate', 'Telecommunications', 'Aerospace', 'Automotive',
        'Biotechnology', 'Consumer Goods', 'Defense'
    ]);
    
    // Cache this fallback value
    companyIndustryCache.set(companyId.toString(), randomIndustry);
    return randomIndustry;
}

async function createRandomJobs() {
    // Pre-populate company industry cache to minimize database calls
    console.log('Fetching company industries...');
    const companies = await CompanyModel.find({}).select('_id industry').lean();
    companies.forEach(company => {
        companyIndustryCache.set(company._id.toString(), company.industry);
    });
    console.log(`Cached ${companyIndustryCache.size} company industries`);

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

    // Create all job documents
    for (let i = 0; i < jobIds.length; i++) {
        const jobId = jobIds[i];
        
        // Each job belongs to a random company
        const companyId = faker.helpers.arrayElement(companyIds);
        
        // Get the company's industry
        const industry = await getCompanyIndustry(companyId);
        
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
                "Background Check", "Driver's License", "Drug Test", "Education",
                "Expertise with Skill", "Hybrid Work", "Industry Experience", "Language",
                "Location", "Onsite Work", "Remote Work", "Urgent Hiring Need",
                "Visa Status", "Work Authorization", "Work Experience", "Custom Question"
              ]),
            specification: faker.lorem.word(),
            idealAnswer: faker.lorem.word(),
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
        
        // Add the job to our array
        jobs.push({
            _id: jobId,
            title: jobTitle,
            industry: industry,
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
            createdAt: faker.date.past({ months: 3 }),
            updatedAt: faker.date.recent()
        });
        
        // Log progress
        if ((i + 1) % 10 === 0 || i === jobIds.length - 1) {
            console.log(`Created ${i + 1}/${jobIds.length} job documents`);
        }
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
        console.log('Starting job seeding process...');
        await createRandomJobs();
        console.log(`Generated ${jobs.length} jobs`);

        const deleteResult = await JobModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing jobs`);

        const insertResult = await JobModel.insertMany(jobs);
        console.log(`Inserted ${insertResult.length} jobs into database`);

        await updateCompanyJobRelationships();
        console.log('Updated company-job relationships');

        // Verify a sample job
        const sampleJob = await JobModel.findById(jobIds[0]);
        console.log('Sample job:', {
            title: sampleJob.title,
            industry: sampleJob.industry,
            workplaceType: sampleJob.workplaceType,
            jobType: sampleJob.jobType,
            location: sampleJob.jobLocation,
            applicantsCount: sampleJob.applicants?.length || 0
        });
        
        // Verify a sample company's job relationships
        const companyWithJobs = await CompanyModel.findById(jobs[0].companyId);
        
        console.log('Job seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding jobs:', error);
    }
}

module.exports = jobSeeder;