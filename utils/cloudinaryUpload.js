const cloudinary = require('../utils/cloudinary');

/**
 * Upload a file to Cloudinary with appropriate resource type.
 * @param {Buffer} fileBuffer - File buffer from Multer.
 * @param {string} type - Resource type or MIME type.
 * @returns {Promise<{ url: string }>} - Upload result.
 */
const uploadFile = (fileBuffer, type = 'auto') => {
  return new Promise((resolve, reject) => {
    // Determine resource_type based on the input
    let resourceType = 'image'; // default
    let folder = 'images';      // default

    // If type is a mime type string, determine the appropriate resource_type
    if (typeof type === 'string' && type.includes('/')) {
      if (type.startsWith('image/')) {
        resourceType = 'image';
        folder = 'images';
      } else if (type.startsWith('video/')) {
        resourceType = 'video';
        folder = 'videos';
      } else if (type.startsWith('application/pdf') ||
        type.startsWith('application/msword') ||
        type.startsWith('application/vnd.openxmlformats-officedocument')) {
        resourceType = 'raw';  // Use 'raw' for documents
        folder = 'documents';
      } else {
        resourceType = 'raw';
        folder = 'miscellaneous';
      }
    }
    // If it's one of our predefined types
    else if (type === 'image') {
      resourceType = 'image';
      folder = 'images';
    } else if (type === 'video') {
      resourceType = 'video';
      folder = 'videos';
    } else if (type === 'raw' || type === 'document') {
      resourceType = 'raw';
      folder = 'documents';
    }
    cloudinary.uploader.upload_stream(
      { 
        resource_type: resourceType, 
        folder,
        ...(resourceType === 'video' && {
          eager: [
            { format: 'mp4', quality: 'auto' }
          ],
          eager_async: true
        })
      },
      (error, uploadResult) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        
        const isPdf = uploadResult.format === 'pdf' ||
          type === 'application/pdf' ||
          (typeof type === 'string' && type.includes('/') && type.includes('pdf'));
        
        console.log('Cloudinary upload successful:', uploadResult.secure_url);
        
        // For videos, return both original and MP4 URLs
        if (resourceType === 'video') {
          resolve({ 
            url: uploadResult.eager?.[0]?.secure_url || uploadResult.secure_url
          });
        } else if (isPdf) {
          resolve({ url: `https://docs.google.com/viewer?url=${encodeURIComponent(uploadResult.secure_url)}&embedded=true` });
        } else {
          resolve({ url: uploadResult.secure_url });
        }
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
  const uploadPromises = files.map(file => uploadFile(file.buffer, file.mimetype || 'auto'));
  return Promise.all(uploadPromises);
};

const deleteFileFromUrl = (fileUrl) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fileUrl) {
        return resolve({ result: 'no file to delete' });
      }

      // Extract parts from the URL
      const urlParts = fileUrl.split('/');

      // Determine resource type based on URL pattern
      let resourceType = 'image'; // default
      if (fileUrl.includes('/video/')) {
        resourceType = 'video';
      } else if (fileUrl.includes('/raw/')) {
        resourceType = 'raw';
      }

      // Find the version part (starts with 'v')
      let versionIndex = -1;
      for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i].match(/^v\d+$/)) {
          versionIndex = i;
          break;
        }
      }

      if (versionIndex === -1) {
        return reject(new Error('Cannot find version in Cloudinary URL'));
      }

      // Extract everything AFTER the version to build the public_id
      const publicId = urlParts.slice(versionIndex + 1).join('/');

      // Remove file extension if present
      const finalPublicId = publicId.includes('.')
        ? publicId.substring(0, publicId.lastIndexOf('.'))
        : publicId;

      console.log(`Attempting to delete from Cloudinary:
        - Resource type: ${resourceType}
        - Public ID: ${finalPublicId}
        - Original URL: ${fileUrl}
      `);

      // Delete the resource using the public ID
      cloudinary.uploader.destroy(finalPublicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          console.error('Cloudinary deletion error:', error);
          return reject(error);
        } else {
          console.log('Deletion result:', result);
          resolve(result);
        }
      });
    } catch (error) {
      console.error('Error in deleteFileFromUrl:', error);
      reject(error);
    }
  });
};

module.exports = { uploadFile, uploadMultipleImages, deleteFileFromUrl };