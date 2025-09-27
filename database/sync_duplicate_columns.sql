-- ALTERNATIVE: KEEP BOTH COLUMN SETS AND USE course_title/course_description as primary
-- This approach keeps all your existing columns and maps them properly

-- ========================================
-- ENSURE ALL COLUMNS EXIST AND ARE PROPERLY CONFIGURED
-- ========================================

-- Make sure all columns exist (in case some are missing)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_title VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT;

-- ========================================
-- DATA MIGRATION: Sync duplicate columns
-- ========================================

-- If you have data in title/description, copy to course_title/course_description
UPDATE courses 
SET 
    course_title = COALESCE(course_title, title, 'Untitled Course'),
    course_description = COALESCE(course_description, description, 'Course description not provided')
WHERE course_title IS NULL OR course_title = '' 
   OR course_description IS NULL OR course_description = '';

-- Copy the other way too (course_title -> title)
UPDATE courses 
SET 
    title = COALESCE(title, course_title),
    description = COALESCE(description, course_description)
WHERE title IS NULL OR title = '' 
   OR description IS NULL OR description = '';

-- ========================================
-- CREATE FUNCTION TO KEEP COLUMNS IN SYNC
-- ========================================

CREATE OR REPLACE FUNCTION sync_course_title_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- When course_title changes, update title
    IF NEW.course_title IS DISTINCT FROM OLD.course_title THEN
        NEW.title = NEW.course_title;
    END IF;
    
    -- When title changes, update course_title
    IF NEW.title IS DISTINCT FROM OLD.title THEN
        NEW.course_title = NEW.title;
    END IF;
    
    -- When course_description changes, update description
    IF NEW.course_description IS DISTINCT FROM OLD.course_description THEN
        NEW.description = NEW.course_description;
    END IF;
    
    -- When description changes, update course_description
    IF NEW.description IS DISTINCT FROM OLD.description THEN
        NEW.course_description = NEW.description;
    END IF;
    
    -- Update timestamp
    NEW.updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to keep columns in sync
DROP TRIGGER IF EXISTS sync_course_columns ON courses;
CREATE TRIGGER sync_course_columns
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION sync_course_title_columns();

-- ========================================
-- VERIFICATION QUERY
-- ========================================

SELECT 
    course_id,
    course_title,
    title,
    LEFT(course_description, 50) as course_desc_preview,
    LEFT(description, 50) as desc_preview,
    category,
    level,
    rating,
    duration
FROM courses 
LIMIT 3;