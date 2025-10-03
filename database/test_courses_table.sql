-- TEST QUERIES TO VERIFY YOUR COURSES TABLE SETUP
-- Run these queries AFTER running final_courses_table_setup.sql

-- ========================================
-- 1. CHECK TABLE STRUCTURE
-- ========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK CONSTRAINTS
-- ========================================
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'courses';

-- ========================================
-- 3. CHECK INDEXES
-- ========================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'courses';

-- ========================================
-- 4. TEST INSERT (SAMPLE DATA)
-- ========================================
-- This will test if your table can accept data from your courseModel.js
-- Replace 'your-instructor-uuid-here' with a real instructor ID

/*
INSERT INTO courses (
    instructor_id,
    title,
    description,
    category,
    level,
    rating,
    duration,
    requirements
) VALUES (
    'your-instructor-uuid-here'::uuid,
    'Test Course',
    'This is a test course to verify the table structure works correctly.',
    'programming',
    'beginner',
    0,
    5,
    'Basic computer knowledge'
);
*/

-- ========================================
-- 5. TEST SELECT (VIEW SAMPLE DATA)
-- ========================================
-- Uncomment to view all courses
-- SELECT * FROM courses ORDER BY created_at DESC LIMIT 5;

-- ========================================
-- 6. COUNT TOTAL COURSES
-- ========================================
SELECT COUNT(*) as total_courses FROM courses;