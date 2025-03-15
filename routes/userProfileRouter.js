const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');
router.route('/:userId')
    .get(mockVerifyToken, user.getUserProfile);
router.route('/')
    .get(mockVerifyToken, user.getAllUsers);
router.route('/education')
    .post(mockVerifyToken,user.addEducation)
    .get(mockVerifyToken,user.getEducations);
router.route('/education/:index')
    .get(mockVerifyToken,user.getEducation)
    .patch(mockVerifyToken,user.editEducation)
    .delete(mockVerifyToken,user.deleteEducation);

router.route('/profile')
    .patch(mockVerifyToken,user.editIntro);

router.route('/experience')
    .post(mockVerifyToken, user.addExperience)
    .get(mockVerifyToken, user.getAllExperiences);

router.route('/experience/:index')
    .get(mockVerifyToken, user.getExperience)
    .put(mockVerifyToken,  user.updateExperience)
    .delete(mockVerifyToken, user.deleteExperience);
router.route('/skills')
    .get(mockVerifyToken, user.getAllSkills)
    .post(mockVerifyToken, user.addSkill);

router.route('/skills/:skillName')
    .get(mockVerifyToken, user.getSkill)
    .put(mockVerifyToken, user.updateSkill)
    .delete(mockVerifyToken, user.deleteSkill);

router.route('/skills/add-endorsement')
    .post(mockVerifyToken, user.addEndorsement);

router.route('/skills/remove-endorsement/:skillName')
    .delete(mockVerifyToken, user.deleteEndorsement);

router.route('/profile-picture')
    .get(mockVerifyToken, user.getProfilePicture)
    .post(mockVerifyToken, upload.single('file'), user.uploadProfilePicture)
    .delete(mockVerifyToken, user.deleteProfilePicture);

router.route('/cover-picture')
    .get(mockVerifyToken, user.getCoverPicture)
    .post(mockVerifyToken, upload.single('file'), user.uploadCoverPicture)
    .delete(mockVerifyToken, user.deleteCoverPicture);

router.route('/resume')
    .get(mockVerifyToken, user.getResume)
    .post(mockVerifyToken, upload.single('resume'), user.uploadResume)
    .delete(mockVerifyToken, user.deleteResume);
router.route('/privacy-settings')
    .patch(mockVerifyToken, user.updatePrivacySettings);
router.route('/follow/:userId')
    .post(mockVerifyToken, user.followEntity)
    .delete(mockVerifyToken, user.unfollowEntity);
//router.route('/skills/endorse')
//    .post(mockVerifyToken, user.endorseSkill);

module.exports = router;