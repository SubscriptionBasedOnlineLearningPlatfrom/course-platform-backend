import { s3 } from '../config/doSpaces.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const uploadCourseThumbnail = async (file, instructorId) => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `images/course-thumbnails/${instructorId}/${fileName}`;

    // Upload parameters
    const uploadParams = {
      Bucket: process.env.DO_SPACES_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make file publicly accessible
    };

    console.log('📤 Uploading course thumbnail to:', filePath);

    // Upload to Digital Ocean Spaces
    const result = await s3.upload(uploadParams).promise();
    
    console.log('✅ Course thumbnail uploaded successfully:', result.Location);
    
    return {
      success: true,
      url: result.Location,
      key: filePath
    };

  } catch (error) {
    console.error('❌ Error uploading course thumbnail:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteCourseThumbnail = async (thumbnailUrl) => {
  try {
    if (!thumbnailUrl) return { success: true };

    // Extract key from URL
    const urlParts = thumbnailUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === process.env.DO_SPACES_NAME);
    
    if (bucketIndex === -1) {
      throw new Error('Invalid thumbnail URL format');
    }

    const key = urlParts.slice(bucketIndex + 1).join('/');

    const deleteParams = {
      Bucket: process.env.DO_SPACES_NAME,
      Key: key
    };

    console.log('🗑️ Deleting course thumbnail:', key);

    await s3.deleteObject(deleteParams).promise();
    
    console.log('✅ Course thumbnail deleted successfully');
    
    return { success: true };

  } catch (error) {
    console.error('❌ Error deleting course thumbnail:', error);
    return {
      success: false,
      error: error.message
    };
  }
};