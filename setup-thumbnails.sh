#!/bin/bash

# Course Thumbnail Setup Script
# This script helps set up the course thumbnail functionality

echo "🎯 Course Thumbnail Setup Script"
echo "================================"

echo ""
echo "📋 Setup Checklist:"
echo ""

echo "1. ✅ Backend Changes Complete:"
echo "   - Updated CourseModel to handle thumbnail_url"
echo "   - Created courseThumbnailUpload utility"
echo "   - Updated CourseController with file upload"
echo "   - Modified course routes with multer middleware"
echo "   - Enhanced delete functionality to clean up thumbnails"
echo ""

echo "2. ✅ Frontend Changes Complete:"
echo "   - Updated CreateCourse form with thumbnail upload"
echo "   - Enhanced ViewCreatedCourse to display thumbnails"
echo "   - Modified API service to handle FormData"
echo ""

echo "3. 🔧 Manual Steps Required:"
echo ""

echo "   Step A: Run Database Migration"
echo "   📍 Go to your Supabase Dashboard > SQL Editor"
echo "   📍 Run this SQL command:"
echo "   ----------------------------------------"
echo "   ALTER TABLE courses ADD COLUMN thumbnail_url TEXT DEFAULT NULL;"
echo "   COMMENT ON COLUMN courses.thumbnail_url IS 'URL to course thumbnail image stored in Digital Ocean Spaces';"
echo "   CREATE INDEX idx_courses_thumbnail_url ON courses(thumbnail_url) WHERE thumbnail_url IS NOT NULL;"
echo "   ----------------------------------------"
echo ""

echo "   Step B: Verify Digital Ocean Spaces Configuration"
echo "   📍 Ensure your .env file has these variables:"
echo "   DO_SPACES_KEY=your_key"
echo "   DO_SPACES_SECRET=your_secret"
echo "   DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com"
echo "   DO_SPACES_NAME=your_bucket_name"
echo "   DO_SPACES_REGION=sgp1"
echo ""

echo "   Step C: Test the Setup"
echo "   📍 Start both servers:"
echo "   Backend: cd course-platform-backend && node server.js"
echo "   Frontend: cd course-platform-instructor-frontend && npm run dev"
echo ""

echo "   Step D: Create a Course with Thumbnail"
echo "   📍 Go to http://localhost:5173/create-course"
echo "   📍 Fill out the form and upload a thumbnail image"
echo "   📍 Submit and verify the course appears with thumbnail"
echo ""

echo "4. 🎨 Features Added:"
echo "   - Course thumbnail upload during course creation"
echo "   - Thumbnail preview in create form"
echo "   - Thumbnail display in course list"
echo "   - Automatic thumbnail cleanup on course deletion"
echo "   - File validation (type and size)"
echo "   - Digital Ocean Spaces integration"
echo ""

echo "5. 📁 File Storage Structure:"
echo "   Digital Ocean Spaces: images/course-thumbnails/{instructor_id}/{filename}"
echo "   Database: courses.thumbnail_url stores the full URL"
echo ""

echo "🎉 Setup Complete!"
echo "Your course platform now supports beautiful course thumbnails!"
echo ""
echo "Need help? Check the logs in both servers for any errors."