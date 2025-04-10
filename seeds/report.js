const { faker } = require('@faker-js/faker');
const ReportModel = require('../models/reportModel');
const { reportIds, userIds, postIds } = require('./init');

const reports = [];

function createRandomReports() {
    for (let i = 0; i < reportIds.length; i++) {
        // Determine if this is a post or user report
        const isPostReport = faker.datatype.boolean();
        
        // Generate appropriate reportedId based on type
        const reportedId = isPostReport 
            ? faker.helpers.arrayElement(postIds)
            : faker.helpers.arrayElement(userIds.filter(id => id !== userIds[0])); // Ensure users don't report themselves
        
        // Choose appropriate policy based on reported type
        const postPolicies = [
            "Harassment", "Fraud or scam", "Spam", "Misinformation", 
            "Hateful speech", "Threats or violence", "Self-harm", 
            "Graphic content", "Dangerous or extremist organizations", 
            "Sexual content", "Fake account", "Child exploitation", 
            "Illegal goods and services", "Infringement"
        ];
        
        const userPolicies = [
            "This person is impersonating someone",
            "This account has been hacked",
            "This account is not a real person",
            "Harassment", 
            "Spam"
        ];
        
        const policy = isPostReport
            ? faker.helpers.arrayElement(postPolicies)
            : faker.helpers.arrayElement(userPolicies);
        
        // Create a "don't want to see" reason for some post reports
        let dontWantToSee = null;
        if (isPostReport && faker.datatype.boolean()) {
            dontWantToSee = faker.helpers.arrayElement([
                "I'm not interested in the author", 
                "I'm not interested in this topic", 
                "I've seen too many posts on this topic", 
                "I've seen this post before", 
                "This post is old", 
                "It's something else"
            ]);
        }
        
        // Randomize moderation status
        const status = faker.helpers.arrayElement([
            'pending',
            'approved',
            'rejected'
        ]);
        
        // Add moderation details for non-pending reports
        let moderationReason = null;
        let moderatedAt = null;
        
        if (status !== 'pending') {
            moderationReason = status === 'approved' 
                ? faker.helpers.arrayElement([
                    'Content violates community standards',
                    'Confirmed spam or misleading content',
                    'Verified harassment',
                    'Contains harmful misinformation'
                ])
                : faker.helpers.arrayElement([
                    'Content does not violate guidelines',
                    'Insufficient evidence for action',
                    'False report',
                    'Already addressed by automated systems'
                ]);
            moderatedAt = faker.date.recent({ days: 30 });
        }
        
        reports.push({
            _id: reportIds[i],
            userId: faker.helpers.arrayElement(userIds), // Random reporting user
            reportedId: reportedId,
            reportedType: isPostReport ? "Post" : "User",
            policy: policy,
            dontWantToSee: dontWantToSee,
            status: status,
            moderationReason: moderationReason,
            moderatedAt: moderatedAt,
            createdAt: faker.date.recent({ days: 60 }) // Reports from the last 60 days
        });
    }
}

async function reportSeeder() {
    try {
        // Generate random reports
        createRandomReports();
        console.log(`Generated ${reports.length} reports`);

        // Clear existing reports
        const deleteResult = await ReportModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} reports`);

        // Insert new reports
        const insertResult = await ReportModel.insertMany(reports);
        console.log(`Inserted ${insertResult.length} reports`);
        
        // Get statistics on report types
        const postReports = reports.filter(report => report.reportedType === "Post").length;
        const userReports = reports.filter(report => report.reportedType === "User").length;
        const pendingReports = reports.filter(report => report.status === "pending").length;
        const approvedReports = reports.filter(report => report.status === "approved").length;
        const rejectedReports = reports.filter(report => report.status === "rejected").length;
        
        console.log('Report statistics:', {
            postReports,
            userReports,
            pendingReports,
            approvedReports,
            rejectedReports
        });

        // Verify a sample report
        const sampleReport = await ReportModel.findById(reportIds[0]);
        console.log('Sample report:', {
            id: sampleReport._id,
            reportedType: sampleReport.reportedType,
            policy: sampleReport.policy,
            status: sampleReport.status
        });
    } catch (error) {
        console.error('Error seeding reports:', error);
    }
}
module.exports = reportSeeder;