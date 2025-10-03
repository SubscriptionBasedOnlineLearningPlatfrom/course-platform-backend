import { supabase } from '../config/supabaseClient.js';
import fs from 'fs';
import path from 'path';

async function createInstructorProfilesTable() {
  try {
    console.log('Creating instructor_profiles table...');
    
    // First, let's check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'instructor_profiles');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('instructor_profiles table already exists');
    } else {
      console.log('Table does not exist, it will be created via Supabase dashboard');
    }

    // Test inserting a sample profile
    const { data, error } = await supabase
      .from('instructor_profiles')
      .upsert([
        {
          instructor_id: 'test-instructor-123',
          email: 'test@instructor.com',
          name: 'Test Instructor',
          bio: 'This is a test instructor profile for testing the system.'
        }
      ])
      .select();

    if (error) {
      console.error('Error creating test profile:', error);
      console.log('You need to create the table in Supabase dashboard first');
    } else {
      console.log('Test profile created successfully:', data);
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

createInstructorProfilesTable();