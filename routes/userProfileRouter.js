const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');

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
    .get(mockVerifyToken, user.getUserExperiences);

router.route('/experience/:index')
    .put(mockVerifyToken,  user.updateExperience);

router.route('/skills')
    .post(mockVerifyToken, user.addSkill)
    .get(mockVerifyToken, user.getUserSkills);

router.route('/skills/:index')
    .put(mockVerifyToken,  user.updateSkill);

router.post('/add-profile-picture', upload.single('file'), user.uploadProfilePicture);
    
router.post('/add-cover-picture', upload.single('file'), user.uploadCoverPicture);

module.exports = router;