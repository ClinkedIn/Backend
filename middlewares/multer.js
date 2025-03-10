const multer = require('multer');

// Configure Multer for memory storage (we'll send files as Buffers to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;