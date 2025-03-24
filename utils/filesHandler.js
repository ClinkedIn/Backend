const customError = require('./customError');
const { uploadFile, uploadMultipleImages, deleteFileFromUrl } = require('./cloudinaryUpload');

const MAX_PICTURE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const INVALID_PICTURE_TYPE_MESSAGE = "Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed."
const INVALID_PICTURE_SIZE_MESSAGE = "File size too large. Maximum allowed size is 5MB."

const INVALID_VIDEO_TYPE_MESSAGE = "Invalid file type. Only MP4, MPEG, OGG, WebM, QuickTime, AVI, WMV, and 3GPP are allowed.";
const INVALID_VIDEO_SIZE_MESSAGE = "File size too large. Maximum allowed size is 50MB.";

const INVALID_DOCUMENT_TYPE_MESSAGE = "Invalid file type. Only PDF, Word, Excel, PowerPoint, and plain text files are allowed.";
const INVALID_DOCUMENT_SIZE_MESSAGE = "File size too large. Maximum allowed size is 10MB.";

const ALLOWED_PICTURE_MIME_TYPES = Object.freeze([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
    'image/heic', 'image/heif', 'image/bmp', 'image/tiff', 'image/svg+xml'
]);

const ALLOWED_VIDEO_MIME_TYPES = Object.freeze([
    'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 
    'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/3gpp'
]);

const ALLOWED_DOCUMENT_MIME_TYPES = Object.freeze([
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
]);

/*
    Documents Habndling.
*/

// Validation Functions for Documents
const validateDocumentFileType = async (ALLOWED_MIME_TYPES, mimeType, ERROR_MESSAGE) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new customError(ERROR_MESSAGE, 400);
    }
};

const validateDocumentFileSize = async (maxSize, fileSize) => {
    if (fileSize > maxSize) {
        throw new customError(INVALID_DOCUMENT_SIZE_MESSAGE, 400);
    }
};

const validateDocumentFile = async (mimeType, fileSize) => {
    await Promise.all([
        validateDocumentFileType(ALLOWED_DOCUMENT_MIME_TYPES, mimeType, INVALID_DOCUMENT_TYPE_MESSAGE),
        validateDocumentFileSize(MAX_DOCUMENT_SIZE, fileSize)
    ]);
};

const uploadDocument = async (fileBuffer, mimeType, fileSize) => {
    await validateDocumentFile(mimeType, fileSize);
    return await uploadFile(fileBuffer, 'raw');
};

/*
    Videos Handling.
*/

// Validation Functions
const validateVideoFileType = async (ALLOWED_MIME_TYPES, mimeType, ERROR_MESSAGE) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new customError(ERROR_MESSAGE, 400);
    }
};

const validateVideoFileSize = async (maxSize, fileSize) => {
    if (fileSize > maxSize) {
        throw new customError(INVALID_VIDEO_SIZE_MESSAGE, 400);
    }
};

const validateVideoFile = async (mimeType, fileSize) => {
    await Promise.all([
        validateVideoFileType(ALLOWED_VIDEO_MIME_TYPES, mimeType, INVALID_VIDEO_TYPE_MESSAGE),
        validateVideoFileSize(MAX_VIDEO_SIZE, fileSize)
    ]);
};

const uploadVideo = async (fileBuffer, mimeType, fileSize) => {
    await validateVideoFile(mimeType, fileSize);
    return await uploadFile(fileBuffer, 'video');
};

/*
    Images Habdling.
*/

// Validation Functions
const validatePictureType = async (ALLOWED_MIME_TYPES, mimeType, ERROR_MESSAGE) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new customError(ERROR_MESSAGE, 400);
    }
};

const validatePictureSize = async (maxSize, fileSize) => {
    if (fileSize > maxSize) {
        throw new customError(INVALID_PICTURE_SIZE_MESSAGE, 400);
    }
};

const validatePicture = async (mimeType, fileSize) => {
    await Promise.all([
        validatePictureType(ALLOWED_PICTURE_MIME_TYPES, mimeType, INVALID_PICTURE_TYPE_MESSAGE),
        validatePictureSize(MAX_PICTURE_SIZE, fileSize)
    ]);
};

const uploadPicture = async (fileBuffer, mimeType, fileSize) => {
    await validatePicture(mimeType, fileSize);
    return await uploadFile(fileBuffer, 'image');
};

module.exports = {
    uploadPicture,
    uploadVideo,
    uploadDocument
};