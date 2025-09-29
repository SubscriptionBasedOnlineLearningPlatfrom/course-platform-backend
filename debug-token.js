import jwt from 'jsonwebtoken';

// The token from your error message
const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6Im5Hdjl5MW9HSFFCUlNXUTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3Jtc3Rxb3hncHZ6aWpubG9rbWllLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZWMwZjYxNy1lZDc0LTQxZTItYWI0Yi00Zjc4YWExZDU4NDciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU5MTI0NzYyLCJpYXQiOjE3NTkxMjExNjIsImVtYWlsIjoic2l2YXByYWdhc2FtcHJpeWEwMUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NTkxMjExNjJ9XSwic2Vzc2lvbl9pZCI6IjM1MTE0ZTdkLTk4YWEtNGRhYi1iNjRhLWQxOWNmZDQ1YjI5ZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.v_QfAuGpIVIltvkBFsEcm0D7iw3Pz-EEVaVW2W4uZlI";

try {
  // Decode without verification to see the payload
  const decoded = jwt.decode(token);
  console.log("Decoded token:", JSON.stringify(decoded, null, 2));
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < now;
  console.log("Token expired:", isExpired);
  console.log("Expires at:", new Date(decoded.exp * 1000));
  console.log("Current time:", new Date());
  
} catch (error) {
  console.error("Error decoding token:", error.message);
}