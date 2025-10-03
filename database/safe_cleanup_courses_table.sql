-- SAFE CLEANUP FOR COURSES TABLE WITH NULL VALUES
-- This version handles existing NULL values properly

-- ========================================
-- STEP 1: HANDLE NULL VALUES FIRST
-- ========================================

-- Check what we're working with
SELECT 
    COUNT(*) as total_rows,
    COUNT(course_title) as non_null_titles,
    COUNT(course_description) as non_null_descriptions,
    COUNT(*) - COUNT(course_title) as null_titles,
    COUNT(*) - COUNT(course_description) as null_descriptions
FROM courses;

-- Update NULL values with defaults
UPDATE courses 
SET 
    course_title = 'Untitled Course'
WHERE course_title IS NULL OR course_title = '';

UPDATE courses 
SET 
    course_description = 'Course description not provided'
WHERE course_description IS NULL OR course_description = '';

UPDATE courses 
SET 
    rating = 0
WHERE rating IS NULL;

-- Verify no more NULLs exist
SELECT 
    COUNT(*) as total_rows,
    COUNT(course_title) as non_null_titles,
    COUNT(course_description) as non_null_descriptions
FROM courses;

-- ========================================
-- STEP 2: DROP DUPLICATE COLUMNS
-- ========================================

-- Drop the duplicate title and description columns if they exist
ALTER TABLE courses DROP COLUMN IF EXISTS title;
ALTER TABLE courses DROP COLUMN IF EXISTS description;

-- ========================================
-- STEP 3: SET NOT NULL CONSTRAINTS (now safe to do)
-- ========================================

-- Now set NOT NULL constraints (after ensuring no NULLs exist)
ALTER TABLE courses ALTER COLUMN course_title SET NOT NULL;
ALTER TABLE courses ALTER COLUMN course_description SET NOT NULL;

-- ========================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(course_title);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- ========================================
-- STEP 5: CREATE TRIGGER FOR AUTO-UPDATE updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_courses_updated_at ON courses;
CREATE TRIGGER trigger_update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

-- ========================================
-- STEP 6: ADD CONSTRAINTS (OPTIONAL)
-- ========================================

-- Level constraint
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

-- Rating constraint
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

-- Duration constraint (allow NULL duration)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_duration_check'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_duration_check 
        CHECK (duration IS NULL OR duration > 0);
    END IF;
END $$;

-- ========================================
-- STEP 7: VERIFY FINAL STRUCTURE
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    course_id,
    course_title,
    LEFT(course_description, 50) as description_preview,
    category,
    level,
    rating,
    duration,
    created_at
FROM courses 
ORDER BY created_at DESC 
LIMIT 3;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Courses table cleanup completed successfully!';
    RAISE NOTICE 'Final structure: course_id, course_title, course_description, instructor_id, category, language, rating, created_at, updated_at, level, duration, requirements';
    RAISE NOTICE 'All NULL values have been handled.';
    RAISE NOTICE 'Your backend code is ready to use!';
    RAISE NOTICE '===========================================';
END $$;