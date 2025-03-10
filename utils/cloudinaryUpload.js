const cloudinary = require('../utils/cloudinary');

/**
 * Upload a file (image or video) to Cloudinary.
 * @param {Buffer} fileBuffer - File buffer from Multer.
 * @param {string} type - "image" or "video".
 * @returns {Promise<{ url: string }>} - Upload result.
 */
const uploadFile = (fileBuffer, type) => {
  return new Promise((resolve, reject) => {
    const folder = type === 'video' ? 'videos' : 'images';

    cloudinary.uploader.upload_stream(
      { resource_type: type, folder },
      (error, uploadResult) => {
        if (error) return reject(error);
        resolve({ url: uploadResult.secure_url });
      }
    ).end(fileBuffer);
  });
};

/**
 * Upload multiple images to Cloudinary.
 * @param {Array} files - Array of file objects from Multer.
 * @returns {Promise<Array<{ url: string }>>} - Upload results.
 */
const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadFile(file.buffer, 'image'));
  return Promise.all(uploadPromises);
};

module.exports = { uploadFile, uploadMultipleImages };