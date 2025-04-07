const express = require('express');
const router = express.Router();
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');
router.route('/me')
    .get(protect, user.getMe);
router.route('/:userId')
    .get(protect, user.getUserProfile);
router.route('/')
    .get(protect, user.getAllUsers);
router.route('/education')
    .post(protect, upload.single('file'), user.addEducation)
    .get(protect,user.getEducations);

router.route('/education/:index')
    .get(protect,user.getEducation)
    .patch(protect, upload.single('file'), user.editEducation)
    .delete(protect,user.deleteEducation);
router.route('/profile')
    .patch(protect,user.editIntro);

router.route('/experience')
    .post(mockVerifyToken, upload.single('file'), user.addExperience)
    .get(mockVerifyToken, user.getAllExperiences);

router.route('/experience/:index')
    .get(mockVerifyToken, user.getExperience)
    .patch(mockVerifyToken,  upload.single('file'), user.updateExperience)
    .delete(mockVerifyToken, user.deleteExperience);
    
router.route('/skills')
    .get(mockVerifyToken, user.getAllSkills)
    .post(mockVerifyToken, user.addSkill);

router.route('/skills/:skillName')
    .get(mockVerifyToken, user.getSkill)
    .patch(mockVerifyToken, user.updateSkill)
    .delete(mockVerifyToken, user.deleteSkill);

router.route('/skills/endorsements/add-endorsement')
    .post(mockVerifyToken, user.addEndorsement);

router.route('/skills/endorsements/remove-endorsement/:skillName')
    .delete(mockVerifyToken, user.deleteEndorsement);

router.route('/pictures/profile-picture')
    .post(mockVerifyToken, upload.single('file'), user.uploadProfilePicture)
    .get(mockVerifyToken, user.getProfilePicture)
    .delete(mockVerifyToken, user.deleteProfilePicture);

router.route('/pictures/cover-picture')
    .get(mockVerifyToken, user.getCoverPicture)
    .post(mockVerifyToken, upload.single('file'), user.uploadCoverPicture)
    .delete(mockVerifyToken, user.deleteCoverPicture);

router.route('/resume')
    .get(protect, user.getResume)
    .post(protect, upload.single('resume'), user.uploadResume)
    .delete(protect, user.deleteResume);
router.route('/privacy-settings')
    .patch(protect, user.updatePrivacySettings);
router.route('/follow/:userId')
    .post(protect, user.followEntity)
    .delete(protect, user.unfollowEntity);
router.route('/contact-info')
    .patch(protect, user.editContactInfo);
//router.route('/skills/endorse')
//    .post(protect, user.endorseSkill);
router.route('/about')
    .patch(protect, user.editAbout);

router.route('/:userId/user-activity')
    .get(protect, user.getUserActivity);



// #################################
/ Search routes (as per /search and / search / users endpoints in Swagger)
router.route('/search')
    .get(protect, user.searchUsers);  // Search for users by name, company, or industry

router.route('/search/users')
    .get(protect, user.searchUsersByName);  // Specific endpoint for name search

// Connection management (as per /connections endpoints in Swagger)
router.route('/connections/request/:targetUserId')
    .post(protect, user.sendConnectionRequest);  // Send connection request

router.route('/connections/requests')
    .get(protect, user.getPendingRequests);  // Get pending connection requests

router.route('/connections/requests/:requestId')
    .patch(protect, user.handleConnectionRequest)  // Accept/Decline connection request
    .delete(protect, user.cancelConnectionRequest);  // Cancel sent request

router.route('/connections/:connectionId')
    .delete(protect, user.removeConnection);  // Remove an existing connection

router.route('/connections')
    .get(protect, user.getConnections);  // Get list of connections

// Following/Unfollowing (existing implementation matches Swagger)
router.route('/follow/:userId')
    .post(protect, user.followEntity)
    .delete(protect, user.unfollowEntity);

// Blocking functionality
router.route('/block/:userId')
    .post(protect, user.blockUser)
    .delete(protect, user.unblockUser);

router.route('/blocked')
    .get(protect, user.getBlockedUsers);

// Messaging requests for non-connections (as per /user/message-requests in Swagger)
router.route('/message-requests')
    .post(protect, user.sendMessageRequest)  // Send message request to non-connection
    .get(protect, user.getMessageRequests);  // Get list of message requests

router.route('/message-requests/:requestId')
    .patch(protect, user.handleMessageRequest);  // Accept/decline message request

// Keep existing routes...
router.route('/education')
    .post(protect, upload.single('file'), user.addEducation)
    .get(protect, user.getEducations);

// ... (rest of the existing routes)


    
module.exports = router;