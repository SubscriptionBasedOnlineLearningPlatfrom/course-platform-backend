// Test script to check if basic course creation works
// Run this with: node test-course-creation.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCourseCreation() {
  console.log("Testing basic course creation...");
  
  try {
    // First, let's see what columns exist in the courses table
    console.log("Checking courses table structure...");
    
    const { data: columns, error: schemaError } = await supabase
      .from("courses")
      .select("*")
      .limit(1);
    
    if (schemaError) {
      console.error("Schema check error:", schemaError);
      return;
    }
    
    console.log("Sample course data structure:", columns);
    
    // Try to create a simple course (using correct column names)
    const testCourse = {
      instructor_id: "f4aae234-333a-4cb1-ba6a-8a97cbd8c80c", // Using existing instructor ID from sample
      course_title: "Test Course",
      course_description: "This is a test course description",
      category: "programming",
      level: "Beginner",
      duration: 5,
      requirements: "Basic computer knowledge"
    };
    
    console.log("Creating test course...");
    const { data, error } = await supabase
      .from("courses")
      .insert([testCourse])
      .select()
      .single();
    
    if (error) {
      console.error("Course creation error:", error);
    } else {
      console.log("Course created successfully:", data);
    }
    
  } catch (error) {
    console.error("Test error:", error);
  }
}

testCourseCreation();