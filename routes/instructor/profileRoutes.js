import express from 'express';
import { 
  uploadProfileImage, 
  getInstructorProfile, 
  deleteProfileImage, 
  updateInstructorProfile,
  uploadMiddleware,
  testDigitalOcean
} from '../../controllers/instructor/profileController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const profileRouter = express.Router();

// Test Digital Ocean connection (no auth needed for testing)
profileRouter.get('/test-do', testDigitalOcean);

// Test endpoint to create/get instructor profiles from database
profileRouter.get('/test-instructor/:id', async (req, res) => {
  try {
    const instructorId = req.params.id;
    
    // Import supabase here
    const { supabase } = await import('../../config/supabaseClient.js');
    
    // Try to get existing profile
    let { data, error } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('instructor_id', instructorId)
      .single();

    // If doesn't exist, create one
    if (!data && !error) {
      const { data: newProfile, error: createError } = await supabase
        .from('instructor_profiles')
        .insert([
          {
            instructor_id: instructorId,
            email: `${instructorId}@example.com`,
            name: `Test Instructor ${instructorId}`,
            bio: `This is a test profile for ${instructorId}`
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating test profile:', createError);
        return res.status(500).json({ error: 'Failed to create test profile' });
      }
      
      data = newProfile;
    } else if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ 
      message: 'Profile retrieved/created successfully', 
      instructor: data 
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile image
profileRouter.post('/upload-image', auth, uploadMiddleware, uploadProfileImage);

// Get instructor profile
profileRouter.get('/', auth, getInstructorProfile);
profileRouter.get('/:instructorId', auth, getInstructorProfile);

// Update instructor profile details
profileRouter.put('/', auth, updateInstructorProfile);

// Delete profile image
profileRouter.delete('/delete-image', auth, deleteProfileImage);

export default profileRouter;