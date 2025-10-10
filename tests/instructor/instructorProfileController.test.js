// tests/instructor/instructorProfileController.test.js
import * as controller from '../../controllers/instructor/profileController.js';
import { supabase } from '../../config/supabaseClient.js';
import { s3 } from '../../config/doSpaces.js';

jest.mock('../../config/supabaseClient.js');
jest.mock('../../config/doSpaces.js');

describe('Instructor Profile Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      instructorId: 'inst1',
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getInstructorProfile', () => {
    it('should retrieve existing profile', async () => {
      // Mock Supabase to return existing profile
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [
              {
                instructor_id: 'inst1',
                email: 'test@inst.com',
                name: 'Test Instructor',
                profile_image_url: 'https://do.test/image.png',
                bio: 'Test bio'
              }
            ],
            error: null
          })
        })
      });

      await controller.getInstructorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        instructor: expect.objectContaining({ instructor_id: 'inst1' })
      }));
    });
  });

  describe('updateInstructorProfile', () => {
    it('should update profile successfully', async () => {
      req.body = { name: 'John Doe', email: 'john@example.com' };

      // Mock Supabase to simulate profile exists
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { instructor_id: 'inst1', name: 'Old Name', email: 'old@example.com' },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { instructor_id: 'inst1', name: 'John Doe', email: 'john@example.com' },
                error: null
              })
            })
          })
        })
      });

      await controller.updateInstructorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        instructor: expect.objectContaining({ name: 'John Doe' })
      }));
    });

    it('should return 400 if name/email missing', async () => {
      req.body = { name: '', email: '' };
      await controller.updateInstructorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Name and email are required'
      }));
    });
  });

  describe('deleteProfileImage', () => {
    it('should delete profile image successfully', async () => {
      // Mock Supabase to return existing image
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_image_url: 'https://do.test/image.png' },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ instructor_id: 'inst1', profile_image_url: null }],
              error: null
            })
          })
        })
      });

      // Mock S3 delete
      s3.deleteObject.mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });

      await controller.deleteProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Profile image deleted successfully',
        instructor: expect.objectContaining({ instructor_id: 'inst1' })
      }));
    });

    it('should return 404 if instructor not found', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      });

      await controller.deleteProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Instructor not found'
      }));
    });
  });
});
