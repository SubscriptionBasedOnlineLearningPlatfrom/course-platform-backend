-- CLEAN UP YOUR EXISTING COURSES TABLE
-- Your current table has: course_id, course_title, course_description, instructor_id, category, language, rating, created_at, updated_at, level, title, description, duration, requirements

-- ========================================
-- OPTION 1: KEEP course_title and course_description (RECOMMENDED)
-- This will use your existing course_title and course_description columns
-- ========================================

-- Drop the duplicate title and description columns if they exist
ALTER TABLE courses DROP COLUMN IF EXISTS title;
ALTER TABLE courses DROP COLUMN IF EXISTS description;

-- Update any NULL values FIRST (before setting NOT NULL constraints)
UPDATE courses 
SET 
    course_title = COALESCE(course_title, 'Untitled Course'),
    course_description = COALESCE(course_description, 'Course description not provided'),
    rating = COALESCE(rating, 0)
WHERE course_title IS NULL OR course_title = '' 
   OR course_description IS NULL OR course_description = ''
   OR rating IS NULL;

-- Now make sure course_title and course_description are properly set up (after updating NULLs)
ALTER TABLE courses ALTER COLUMN course_title SET NOT NULL;
ALTER TABLE courses ALTER COLUMN course_description SET NOT NULL;

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(course_title);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- ========================================
-- CREATE TRIGGER FOR AUTO-UPDATE updated_at
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
-- ADD CONSTRAINTS
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

-- Duration constraint
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
-- VERIFY FINAL STRUCTURE
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Courses table cleanup completed!';
    RAISE NOTICE 'Final columns: course_id, course_title, course_description, instructor_id, category, language, rating, created_at, updated_at, level, duration, requirements';
END $$;