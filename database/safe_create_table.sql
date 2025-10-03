-- Safe SQL script for Supabase - handles existing objects gracefully
-- Run this in Supabase SQL Editor

-- Step 1: Create the table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS instructor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    bio TEXT,
    profile_image_url TEXT,
    expertise TEXT[],
    phone VARCHAR(20),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_instructor_id ON instructor_profiles(instructor_id);

-- Step 3: Create function (replace if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Drop and recreate trigger to avoid conflict
DROP TRIGGER IF EXISTS update_instructor_profiles_updated_at ON instructor_profiles;
CREATE TRIGGER update_instructor_profiles_updated_at 
    BEFORE UPDATE ON instructor_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Step 5: Insert test data (only if not exists)
INSERT INTO instructor_profiles (instructor_id, email, name, bio) VALUES 
('test-instructor-123', 'test@instructor.com', 'Test Instructor', 'Sample instructor profile for testing'),
('instructor-1', 'john@instructor.com', 'John Smith', 'Experienced software developer and instructor'),
('instructor-2', 'jane@instructor.com', 'Jane Doe', 'Data science and machine learning expert')
ON CONFLICT (instructor_id) DO NOTHING;

-- Step 6: Verify the table was created successfully
SELECT 'Table created successfully!' as status, count(*) as sample_records FROM instructor_profiles;