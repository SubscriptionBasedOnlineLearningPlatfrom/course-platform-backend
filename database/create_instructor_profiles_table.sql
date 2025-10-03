-- Create instructor_profiles table in Supabase
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

-- Create an index on instructor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_instructor_id ON instructor_profiles(instructor_id);

-- Create a trigger to automatically update the updated_at column
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

-- Insert some sample data for testing
INSERT INTO instructor_profiles (instructor_id, email, name, bio) VALUES 
('test-instructor-123', 'test@instructor.com', 'Test Instructor', 'Sample instructor profile for testing'),
('instructor-1', 'john@instructor.com', 'John Smith', 'Experienced software developer and instructor'),
('instructor-2', 'jane@instructor.com', 'Jane Doe', 'Data science and machine learning expert')
ON CONFLICT (instructor_id) DO NOTHING;