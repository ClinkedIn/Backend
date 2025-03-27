const cloudinary = require('../utils/cloudinary');
const { uploadFile, uploadMultipleImages,deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const uploadPostAttachments = async (files) => {
    // Return empty array if no files
    if (!files || files.length === 0) {
        return [];
    }
    
    // Validate number of attachments
    if (files.length > 10) {
        throw new Error('Maximum 10 files allowed per post');
    }
    
    // Check if there's more than one video
    const videoFiles = files.filter(file => 
        file.mimetype.startsWith('video/')
    );
    
    if (videoFiles.length > 0 && files.length > 1) {
        throw new Error('Videos must be uploaded alone without other attachments');
    }
    
    // Validate file sizes
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    
    for (const file of files) {
        const isVideo = file.mimetype.startsWith('video/');
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        
        if (file.size > maxSize) {
            throw new Error(`File ${file.originalname} exceeds maximum size limit`);
        }
    }
    
    // Upload files to Cloudinary
    try {
        const uploadResults = await uploadMultipleImages(files);
        return uploadResults.map(result => result.url);
    } catch (error) {
        console.error('Error in uploadPostAttachments:', error);
        throw new Error(`Failed to upload files: ${error.message}`);
    }
};

module.exports = {
    uploadPostAttachments
};