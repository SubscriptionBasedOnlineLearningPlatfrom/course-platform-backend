import { s3 } from "../../config/doSpaces.js";
import multer from 'multer';
import path from 'path';
import { supabase } from "../../config/supabaseClient.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Upload profile image to Digital Ocean Spaces
export const uploadProfileImage = async (req, res) => {
  try {
    const instructorId = req.instructorId || req.body.instructorId; // Get from auth middleware or request body
    
    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `instructor-${instructorId}-${timestamp}${fileExtension}`;
    
    // Digital Ocean Spaces path: onlinelearningplatform/images/instructor-profiles/
    const key = `images/instructor-profiles/${fileName}`;

    const uploadParams = {
      Bucket: process.env.DO_SPACES_NAME || 'onlinelearningplatform',
      Key: key,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };

    // Upload to Digital Ocean Spaces
    console.log('Uploading to Digital Ocean with params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      FileSize: req.file.buffer.length
    });
    
    const result = await s3.upload(uploadParams).promise();
    console.log('Upload successful:', result.Location);

    // Update instructor profile in database with new image URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('instructor_profiles')
      .update({ 
        profile_image_url: result.Location,
        updated_at: new Date().toISOString()
      })
      .eq('instructor_id', instructorId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      // Still return success since image was uploaded to Digital Ocean
      console.log('Profile image uploaded to Digital Ocean but failed to update database');
    } else {
      console.log('Profile image uploaded and database updated successfully');
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      imageUrl: result.Location,
      instructorId: instructorId,
      fileName: fileName,
      instructor: updatedProfile
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ 
      error: "Failed to upload profile image", 
      details: error.message 
    });
  }
};

// Get instructor profile with image
export const getInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.instructorId || req.params.instructorId;
    
    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    console.log('Fetching profile for instructor:', instructorId);

    // Try to find the instructor profile (don't use .single() to avoid errors when no rows exist)
    let { data, error } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('instructor_id', instructorId);

    console.log('Database query result:', { data, error });
    
    if (error) {
      console.error('Supabase query error details:', error);
      return res.status(500).json({ 
        error: "Database query failed",
        details: error.message || error.code || 'Unknown database error'
      });
    }

    // If instructor doesn't exist, create a new profile
    if (!data || data.length === 0) {
      console.log('Creating new instructor profile for:', instructorId);
      const { data: newInstructor, error: createError } = await supabase
        .from('instructor_profiles')
        .insert([
          {
            instructor_id: instructorId,
            email: `${instructorId}@instructor.com`,
            name: `Instructor ${instructorId}`,
            bio: 'Welcome to my profile!'
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating instructor profile:', createError);
        return res.status(500).json({ error: "Failed to create instructor profile" });
      }
      
      data = newInstructor;
    } else {
      // Profile exists, use the first (and should be only) result
      data = data[0];
    }

    if (!data) {
      return res.status(404).json({ error: "Instructor profile not found" });
    }

    console.log('Profile retrieved:', {
      instructor_id: data.instructor_id,
      email: data.email,
      has_profile_image: !!data.profile_image_url
    });

    res.status(200).json({
      message: "Instructor profile retrieved successfully",
      instructor: data
    });

  } catch (error) {
    console.error('Get instructor profile error:', error);
    res.status(500).json({ 
      error: "Failed to retrieve instructor profile", 
      details: error.message 
    });
  }
};

// Update instructor profile (name, bio, email, etc.)
export const updateInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.instructorId || req.body.instructorId;
    const { name, bio, email, phone, website, social_links, expertise } = req.body;
    
    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    console.log('Updating profile for instructor:', instructorId, req.body);

    // First, check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('instructor_id', instructorId)
      .single();

    let updateData = {
      name,
      email,
      bio: bio || '',
      phone: phone || null,
      website: website || null,
      social_links: social_links || {},
      expertise: expertise || []
    };

    let result;
    
    if (!existingProfile && !fetchError) {
      // Create new profile if doesn't exist
      console.log('Creating new profile for:', instructorId);
      const { data, error } = await supabase
        .from('instructor_profiles')
        .insert([{
          instructor_id: instructorId,
          ...updateData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return res.status(500).json({ error: "Failed to create profile" });
      }
      result = data;
    } else if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile for:', instructorId);
      const { data, error } = await supabase
        .from('instructor_profiles')
        .update(updateData)
        .eq('instructor_id', instructorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: "Failed to update profile" });
      }
      result = data;
    } else {
      console.error('Database error:', fetchError);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      instructor: result
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: "Failed to update profile", 
      details: error.message 
    });
  }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const instructorId = req.instructorId || req.body.instructorId;
    
    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    // Get current profile image URL from database
    const { data: instructor, error: fetchError } = await supabase
      .from('instructors')
      .select('profile_image_url')
      .eq('instructor_id', instructorId)
      .single();

    if (fetchError || !instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    // If there's an existing image, delete it from Digital Ocean Spaces
    if (instructor.profile_image_url) {
      try {
        // Extract key from URL
        const url = new URL(instructor.profile_image_url);
        const key = url.pathname.substring(1); // Remove leading slash

        const deleteParams = {
          Bucket: process.env.DO_SPACES_NAME || 'onlinelearningplatform',
          Key: key
        };

        await s3.deleteObject(deleteParams).promise();
      } catch (deleteError) {
        console.error('Error deleting from Digital Ocean:', deleteError);
        // Continue even if deletion from DO fails
      }
    }

    // Update database to remove image URL
    const { data, error } = await supabase
      .from('instructors')
      .update({ 
        profile_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('instructor_id', instructorId)
      .select();

    if (error) {
      console.error('Database update error:', error);
      return res.status(500).json({ error: "Failed to update profile in database" });
    }

    res.status(200).json({
      message: "Profile image deleted successfully",
      instructor: data[0]
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ 
      error: "Failed to delete profile image", 
      details: error.message 
    });
  }
};

// Test Digital Ocean connection
export const testDigitalOcean = async (req, res) => {
  try {
    console.log('=== Testing Digital Ocean connection ===');
    console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT);
    console.log('DO_SPACES_NAME:', process.env.DO_SPACES_NAME);
    console.log('DO_SPACES_REGION:', process.env.DO_SPACES_REGION);
    console.log('DO_SPACES_KEY:', process.env.DO_SPACES_KEY ? `Set (${process.env.DO_SPACES_KEY})` : 'Not set');
    console.log('DO_SPACES_SECRET:', process.env.DO_SPACES_SECRET ? 'Set (hidden)' : 'Not set');
    
    // Test s3 configuration
    console.log('S3 Config:', {
      endpoint: s3.config.endpoint,
      accessKeyId: s3.config.accessKeyId ? 'Set' : 'Not set',
      secretAccessKey: s3.config.secretAccessKey ? 'Set' : 'Not set'
    });
    
    // Test by listing buckets or creating a test file
    const testParams = {
      Bucket: process.env.DO_SPACES_NAME || 'onlinelearningplatform',
      Key: 'test/connection-test.txt',
      Body: 'Digital Ocean connection test',
      ACL: 'public-read',
      ContentType: 'text/plain',
    };

    console.log('Attempting upload with params:', testParams);
    const result = await s3.upload(testParams).promise();
    console.log('Test upload successful:', result.Location);
    
    res.status(200).json({
      message: "Digital Ocean connection successful",
      testFileUrl: result.Location,
      config: {
        endpoint: process.env.DO_SPACES_ENDPOINT,
        bucket: process.env.DO_SPACES_NAME,
        region: process.env.DO_SPACES_REGION
      }
    });

  } catch (error) {
    console.error('=== Digital Ocean test error ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: "Digital Ocean connection failed", 
      details: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
  }
};

// Multer middleware for single file upload
export const uploadMiddleware = upload.single('profileImage');