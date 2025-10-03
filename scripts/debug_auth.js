// Test if you can access the protected course creation endpoint
// This will help us debug the 401 Unauthorized error

// Method 1: Test with curl (run in terminal)
/*
curl -X POST http://localhost:4000/instructor/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Test Course",
    "description": "Test Description",
    "category": "programming",
    "level": "beginner",
    "duration": "5"
  }'
*/

// Method 2: Check if you have a valid token in localStorage
console.log("JWT Token in localStorage:", localStorage.getItem('token'));

// Method 3: Test login first
fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login response:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token saved to localStorage');
  }
})
.catch(error => console.error('Login error:', error));