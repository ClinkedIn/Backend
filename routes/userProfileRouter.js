const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');

router.route('/education')
    .patch(mockVerifyToken,user.addEducation);

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

router.route('/add-profile-picture')
    .get(mockVerifyToken, user.getProfilePicture)
    .post(mockVerifyToken, upload.single('file'), user.uploadProfilePicture)
    .delete(mockVerifyToken, user.deleteProfilePicture);

router.route('/add-cover-picture')
    .get(mockVerifyToken, user.getCoverPicture)
    .post(mockVerifyToken, upload.single('file'), user.uploadCoverPicture)
    .delete(mockVerifyToken, user.deleteCoverPicture);

//router.route('/skills/endorse')
//    .post(mockVerifyToken, user.endorseSkill);

module.exports = router;