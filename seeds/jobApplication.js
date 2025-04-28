const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const JobModel = require('../models/jobModel');
const JobApplicationModel = require('../models/jobApplicationModel');
const UserModel = require('../models/userModel');

// Helper function to generate realistic answers to screening questions
const generateScreeningAnswer = (question, idealAnswer, isAccepted, mustHave) => {
  // If user is accepted, or if question is must-have, create a matching answer
  if (isAccepted || (mustHave && Math.random() > 0.3)) {
    switch (question) {
      case "Background Check":
        return "Yes, I consent to a background check.";
      case "Driver's License":
        return "Yes, I have a valid driver's license.";
      case "Drug Test":
        return "Yes, I am willing to take a drug test.";
      case "Education":
        return idealAnswer || "Bachelor's degree in relevant field";
      case "Expertise with Skill":
        return `Yes, I have ${faker.number.int({min: 2, max: 10})} years of experience with ${idealAnswer || 'this skill'}.`;
      case "Hybrid Work":
        return "Yes, I am available for hybrid work.";
      case "Industry Experience":
        return `Yes, I have ${faker.number.int({min: 1, max: 8})} years of experience in ${idealAnswer || 'this industry'}.`;
      case "Language":
        return `Yes, I am ${faker.helpers.arrayElement(['fluent', 'proficient', 'conversational'])} in ${idealAnswer || 'this language'}.`;
      case "Location":
        return `Yes, I am located in ${idealAnswer || 'this location'}.`;
      case "Onsite Work":
        return "Yes, I am available for onsite work.";
      case "Remote Work":
        return "Yes, I am equipped for remote work.";
      case "Urgent Hiring Need":
        return `Yes, I can start ${faker.helpers.arrayElement(['immediately', 'in two weeks', 'within a month'])}.`;
      case "Visa Status":
        return "I am authorized to work in this country.";
      case "Work Authorization":
        return "Yes, I am legally authorized to work.";
      case "Work Experience":
        return `Yes, I have ${faker.number.int({min: 2, max: 15})} years of experience.`;
      default:
        return "Yes"; // Default positive answer for custom questions
    }
  } else {
    // For rejected applicants, sometimes give non-ideal answers
    switch (question) {
      case "Background Check":
        return faker.helpers.arrayElement([
          "Yes, I consent to a background check.",
          "I would prefer not to undergo a background check."
        ]);
      case "Driver's License":
        return faker.helpers.arrayElement([
          "Yes, I have a valid driver's license.",
          "No, I don't currently have a driver's license."
        ]);
      case "Drug Test":
        return faker.helpers.arrayElement([
          "Yes, I am willing to take a drug test.",
          "I would prefer not to take a drug test."
        ]);
      case "Education":
        return faker.helpers.arrayElement([
          idealAnswer || "Bachelor's degree in relevant field",
          "I have some coursework but no degree",
          "I'm self-taught in this field"
        ]);
      case "Expertise with Skill":
        return faker.helpers.arrayElement([
          `Yes, I have ${faker.number.int({min: 2, max: 10})} years of experience with ${idealAnswer || 'this skill'}.`,
          "I have basic knowledge but limited experience",
          "I'm currently learning this skill"
        ]);
      case "Work Experience":
        return faker.helpers.arrayElement([
          `Yes, I have ${faker.number.int({min: 2, max: 15})} years of experience.`,
          "I have less than a year of experience.",
          "This would be my first job in this field."
        ]);
      default:
        return faker.helpers.arrayElement(["Yes", "No", "Maybe", "I'm not sure"]);
    }
  }
};

const seedJobApplications = async () => {
  try {
    console.log('Starting job application seeding...');
    
    // Clear existing job applications
    await JobApplicationModel.deleteMany({});
    console.log('Cleared existing job applications');

    // Get all jobs from the database
    const jobs = await JobModel.find({ isActive: true }).lean();
    console.log(`Found ${jobs.length} active jobs`);
    
    let totalApplications = 0;
    const applications = [];
    
    // Process each job to create applications
    for (const job of jobs) {
      console.log(`Processing applications for job: ${job.title}`);
      
      // Skip jobs without applicants
      if (!job.applicants || job.applicants.length === 0) {
        console.log(`Job ${job.title} has no applicants, skipping`);
        continue;
      }
      
      // Create sets for easier checking
      const acceptedSet = new Set(job.accepted?.map(id => id.toString()) || []);
      const rejectedSet = new Set(job.rejected?.map(id => id.toString()) || []);
      
      // Process each applicant
      for (const applicantId of job.applicants) {
        const userId = applicantId.toString();
        const isAccepted = acceptedSet.has(userId);
        const isRejected = rejectedSet.has(userId);
        
        // Determine application status
        let status;
        if (isAccepted) status = "accepted";
        else if (isRejected) status = "rejected";
        else status = faker.helpers.arrayElement(["pending", "viewed", "pending", "pending"]); // More weight to pending
        
        // Get user details for contact info
        const user = await UserModel.findById(userId).lean();
        if (!user) {
          console.log(`User ${userId} not found, skipping application`);
          continue;
        }
        
        // Generate application answers to screening questions
        const screeningAnswers = (job.screeningQuestions || []).map(sq => {
          return {
            questionId: new mongoose.Types.ObjectId(), // Generate a new ID for the question
            question: sq.question,
            questionType: sq.question,
            answer: generateScreeningAnswer(sq.question, sq.idealAnswer, isAccepted, sq.mustHave),
            meetsCriteria: isAccepted ? true : isRejected ? false : Math.random() > 0.3
          };
        });
        
        // Create application object
        const application = {
          jobId: job._id,
          userId: userId,
          companyId: job.companyId,
          status,
          contactEmail: user.email || faker.internet.email(),
          contactPhone: user.phone || faker.phone.number(),
          screeningAnswers,
          createdAt: faker.date.recent({ days: 30 }),
          updatedAt: faker.date.recent({ days: 15 })
        };
        
        // Add rejection reason if rejected
        if (status === "rejected") {
          application.rejectionReason = faker.helpers.arrayElement([
            "We've decided to move forward with candidates whose qualifications better match our needs.",
            "We found candidates with more experience in this specific role.",
            "Your qualifications are impressive, but we're looking for someone with more industry-specific experience.",
            "Thank you for your interest, but we've selected candidates who more closely align with our current requirements.",
            null
          ]);
          
          application.autoRejected = Math.random() > 0.7; // 30% chance of auto-rejection
          application.lastViewed = faker.date.recent({ days: 10 });
        }
        
        // Add lastViewed date for viewed or accepted applications
        if (status === "viewed" || status === "accepted") {
          application.lastViewed = faker.date.recent({ days: 10 });
        }
        
        applications.push(application);
        totalApplications++;
      }
    }
    
    // Insert all applications in batch
    if (applications.length > 0) {
      await JobApplicationModel.insertMany(applications);
      console.log(`Successfully seeded ${totalApplications} job applications`);
    } else {
      console.log('No applications to seed');
    }
    
    // Verify seeding
    const count = await JobApplicationModel.countDocuments();
    console.log(`Total job applications in database: ${count}`);
    
    return { success: true, count };
    
  } catch (error) {
    console.error('Error seeding job applications:', error);
    return { success: false, error: error.message };
  }
};

module.exports = seedJobApplications;