const express = require('express');
const upload = require('../middlewares/multer');
const { uploadFile, uploadMultipleImages } = require('../utils/cloudinaryUpload');
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');
const User = require('../models/userModel');
const router = express.Router();

// **Single Image Upload**
router.post('/profile-picture', mockVerifyToken, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const userId = req.user.id;
      const result = await uploadFile(req.file.buffer, 'image');
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { profilePicture: result.url } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        message: 'Profile picture updated successfully',
        profilePicture: result.url
      });
  
    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload profile picture',
        details: error.message 
      });
    }
  });

// **Multiple Images Upload**
router.post('/images', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    const results = await uploadMultipleImages(req.files);

    const files = results.map(result => ({ url: result.url, type: 'image' }));
    await File.insertMany(files);

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Single Video Upload**
router.post('/video', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await uploadFile(req.file.buffer, 'video');

    const file = new File({ url: result.url, type: 'video' });
    await file.save();

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;