-- FINAL DATABASE SETUP FOR COURSES TABLE
-- This script will set up your courses table to work perfectly with your courseModel.js
-- Run this entire script in your Supabase SQL Editor

-- First, let's check if the courses table exists and what columns it has
-- (This is just for reference, the actual commands start below)

-- ========================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLE
-- ========================================

-- Add instructor_id column (UUID to link with instructors table)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id UUID;

-- Add title column (required for course name)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT '';

-- Add description column (required for course details)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

-- Add duration column (course duration in hours)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Add requirements column (course prerequisites)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS requirements TEXT;

-- ========================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Index on instructor_id for faster queries by instructor
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- Index on title for search functionality
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);

-- Index on category (already exists in your table, but ensuring it's indexed)
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Index on level (already exists in your table, but ensuring it's indexed)
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- Index on rating for sorting by rating
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);

-- Index on created_at for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- ========================================
-- STEP 3: CREATE/UPDATE TRIGGER FOR UPDATED_AT
-- ========================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_courses_updated_at ON courses;

-- Create new trigger
CREATE TRIGGER trigger_update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

-- ========================================
-- STEP 4: ADD CONSTRAINTS (OPTIONAL BUT RECOMMENDED)
-- ========================================

-- Add check constraint for level (ensure only valid levels)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_level_check'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_level_check 
        CHECK (level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END $$;

-- Add check constraint for rating (ensure rating is between 0 and 5)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_rating_check'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_rating_check 
        CHECK (rating >= 0 AND rating <= 5);
    END IF;
END $$;

-- Add check constraint for duration (ensure positive duration)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_duration_check'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_duration_check 
        CHECK (duration > 0);
    END IF;
END $$;

-- ========================================
-- STEP 5: SET DEFAULT VALUES FOR EXISTING RECORDS
-- ========================================

-- Update any existing records that might have NULL values
UPDATE courses 
SET 
    title = COALESCE(title, 'Untitled Course'),
    description = COALESCE(description, 'Course description not provided'),
    rating = COALESCE(rating, 0)
WHERE title IS NULL OR title = '' 
   OR description IS NULL OR description = ''
   OR rating IS NULL;

-- ========================================
-- STEP 6: VERIFY TABLE STRUCTURE
-- ========================================

-- Run this query to see your final table structure
-- (Uncomment the lines below to run this verification)

/*
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;
*/

-- ========================================
-- FINAL TABLE STRUCTURE AFTER RUNNING THIS SCRIPT:
-- ========================================

/*
Your courses table will have these columns:

EXISTING COLUMNS (from your current table):
- course_id (UUID, Primary Key)
- category (VARCHAR)
- language (VARCHAR) - not used in app but kept
- rating (NUMERIC) - with constraint 0-5
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) - with auto-update trigger
- level (VARCHAR) - with constraint for valid levels

NEW COLUMNS (added by this script):
- instructor_id (UUID) - links to instructor
- title (VARCHAR, NOT NULL) - course title
- description (TEXT, NOT NULL) - course description  
- duration (INTEGER) - course duration in hours
- requirements (TEXT) - course prerequisites

INDEXES CREATED:
- idx_courses_instructor_id
- idx_courses_title
- idx_courses_category
- idx_courses_level
- idx_courses_rating
- idx_courses_created_at

CONSTRAINTS ADDED:
- courses_level_check (beginner, intermediate, advanced)
- courses_rating_check (0-5 rating)
- courses_duration_check (positive duration)

TRIGGERS:
- trigger_update_courses_updated_at (auto-update updated_at)
*/

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE 'Courses table setup completed successfully!';
    RAISE NOTICE 'Your table is now ready to work with your courseModel.js';
    RAISE NOTICE 'You can now create courses from your frontend application.';
END $$;