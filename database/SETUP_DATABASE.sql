-- Step 1: Create the instructor_profiles table
CREATE TABLE instructor_profiles (
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

-- Step 2: Create index for faster lookups
CREATE INDEX idx_instructor_profiles_instructor_id ON instructor_profiles(instructor_id);

-- Step 3: Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instructor_profiles_updated_at 
    BEFORE UPDATE ON instructor_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Step 4: Insert test data
INSERT INTO instructor_profiles (instructor_id, email, name, bio) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'test@instructor.com', 'Test Instructor', 'Sample instructor profile for testing'),
('instructor-1', 'john@instructor.com', 'John Smith', 'Experienced software developer and instructor'),
('instructor-2', 'jane@instructor.com', 'Jane Doe', 'Data science and machine learning expert')
ON CONFLICT (instructor_id) DO NOTHING;