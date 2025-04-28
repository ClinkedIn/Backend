const express = require('express');
const router = express.Router();
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');

// 1. STATIC ROUTES FIRST
router.route('/')
    .get(protect, user.getAllUsers);

router.route('/me')
    .get(protect, user.getMe);

router.route('/profile')
    .patch(protect, user.editIntro);

router.route('/contact-info')
    .patch(protect, user.editContactInfo);

router.route('/about')
    .patch(protect, user.editAbout);

router.route('/privacy-settings')
    .patch(protect, user.updatePrivacySettings);

// 2. EDUCATION ROUTES
router.route('/education')
    .post(protect, upload.single('file'), user.addEducation)
    .get(protect, user.getEducations);

router.route('/education/:index')
    .get(protect, user.getEducation)
    .patch(protect, upload.single('file'), user.editEducation)
    .delete(protect, user.deleteEducation);

// 3. EXPERIENCE ROUTES
router.route('/experience')
    .post(protect, upload.single('file'), user.addExperience)
    .get(protect, user.getAllExperiences);

router.route('/experience/:index')
    .get(protect, user.getExperience)
    .patch(protect, upload.single('file'), user.updateExperience)
    .delete(protect, user.deleteExperience);

// 4. SKILLS ROUTES - MOST SPECIFIC TO LEAST SPECIFIC
router.route('/skills/endorsements/add-endorsement')
    .post(protect, user.addEndorsement);

router.route('/skills/endorsements/remove-endorsement/:skillName')
    .delete(protect, user.deleteEndorsement);

router.route('/skills/:skillName')
    .get(protect, user.getSkill)
    .patch(protect, user.updateSkill)
    .delete(protect, user.deleteSkill);

router.route('/skills')
    .get(protect, user.getAllSkills)
    .post(protect, user.addSkill);

// 5. MEDIA ROUTES
router.route('/pictures/profile-picture')
    .post(protect, upload.single('file'), user.uploadProfilePicture)
    .get(protect, user.getProfilePicture)
    .delete(protect, user.deleteProfilePicture);

router.route('/pictures/cover-picture')
    .get(protect, user.getCoverPicture)
    .post(protect, upload.single('file'), user.uploadCoverPicture)
    .delete(protect, user.deleteCoverPicture);

router.route('/resume')
    .get(protect, user.getResume)
    .post(protect, upload.single('resume'), user.uploadResume)
    .delete(protect, user.deleteResume);

// 6. FOLLOW/UNFOLLOW ROUTES
router.route('/follow/:userId')
    .post(protect, user.followEntity)
    .delete(protect, user.unfollowEntity);

// #################################
// Search routes (as per /search and / search / users endpoints in Swagger)

router.route('/search')
    .get(protect, user.searchUsers);  // Search for users by name, company, or industry

router.route('/search/users')
    .get(protect, user.searchUsersByName);  // Specific endpoint for name search

// Connection management (as per /connections endpoints in Swagger)
router.route('/connections/request/:targetUserId')
    .post(protect, user.sendConnectionRequest);  // Send connection request

router.route('/connections/requests')
    .get( protect,user.getPendingRequests);  // Get pending connection requests

router.route('/connections/requests/:senderId')
    .patch(protect, user.handleConnectionRequest)  // Accept/Decline connection request
    
    
router.route('/connections')
    .get(protect, user.getConnectionsList);  // Get list of connections

router.route('/connections/:connectionId')
    .delete(protect, user.removeConnection);  // Remove an existing connection

// Following/Unfollowing (existing implementation matches Swagger)
router.route('/follow/:userId')
    .post(protect, user.followEntity)
    .delete(protect, user.unfollowEntity);

    router.route('/blocked')
        .get(protect, user.getBlockedUsers);
// Blocking functionality
router.route('/block/:userId')
    .post(protect, user.blockUser)
    .delete(protect, user.unblockUser);


// Messaging requests for non-connections (as per /user/message-requests in Swagger)
router.route('/message-requests')
.get(protect, user.getMessageRequests);  // Get list of message requests

router.route('/message-requests/:requestId')
.patch(protect, user.handleMessageRequest)  // Accept/decline message request
.post(protect, user.sendMessageRequest);// Send message request to non-connection

// Keep existing routes...
router.route('/education')
    .post(protect, upload.single('file'), user.addEducation)
    .get(protect, user.getEducations);
// 7. USER PROFILE ROUTES WITH PARAMETERS (MOST GENERAL)
router.route('/:userId/user-activity')
    .get(protect, user.getUserActivity);

router.route('/:userId')
    .get(protect, user.getUserProfile);










    
module.exports = router;