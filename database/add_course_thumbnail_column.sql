-- Add thumbnail_url column to courses table
-- Run this in your Supabase SQL editor

ALTER TABLE courses 
ADD COLUMN thumbnail_url TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN courses.thumbnail_url IS 'URL to course thumbnail image stored in Digital Ocean Spaces';

-- Optional: Add index for better performance when filtering by thumbnail existence
CREATE INDEX idx_courses_thumbnail_url ON courses(thumbnail_url) WHERE thumbnail_url IS NOT NULL;