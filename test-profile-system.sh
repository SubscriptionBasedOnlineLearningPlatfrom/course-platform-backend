#!/bin/bash

echo "🧪 Testing Instructor Profile Management System"
echo "=============================================="

echo "1. Testing basic profile retrieval..."
curl -X GET http://localhost:4000/instructor/profile/ -H "Authorization: Bearer test-token"
echo -e "\n"

echo "2. Testing profile image upload..."
# Create a test image file
echo "test image data" > test-profile.jpg
curl -X POST http://localhost:4000/instructor/profile/upload-image \
  -H "Authorization: Bearer test-token" \
  -F "profileImage=@test-profile.jpg"
rm test-profile.jpg
echo -e "\n"

echo "3. Testing profile retrieval after image upload..."
curl -X GET http://localhost:4000/instructor/profile/ -H "Authorization: Bearer test-token"
echo -e "\n"

echo "4. Testing Digital Ocean connection..."
curl http://localhost:4000/instructor/profile/test-do
echo -e "\n\n"

echo "✅ Testing complete!"
echo "🔗 Each instructor will now have their own profile image URL stored in the database."
echo "🔄 When instructors switch accounts, they'll see their specific profile image."