#!/usr/bin/env node

import fetch from 'node-fetch';

async function testGoogleCallback() {
  try {
    console.log('Testing Google OAuth callback...');
    
    // Test the basic endpoint first
    const basicResponse = await fetch('http://localhost:4000/test-simple');
    console.log('Basic endpoint status:', basicResponse.status);
    const basicData = await basicResponse.json();
    console.log('Basic endpoint response:', basicData);
    
    // Test the Google callback endpoint
    const callbackUrl = 'http://localhost:4000/auth/google/callback?state=test&code=test&scope=email+profile';
    const response = await fetch(callbackUrl, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects
    });
    
    console.log('Google callback status:', response.status);
    console.log('Google callback headers:', Object.fromEntries(response.headers));
    
    if (response.status === 302) {
      console.log('✅ SUCCESS: No more 500 error! Got redirect (302) instead of 500');
      console.log('Redirect location:', response.headers.get('location'));
    } else if (response.status === 500) {
      console.log('❌ STILL FAILING: 500 error persists');
      const errorText = await response.text();
      console.log('Error details:', errorText);
    } else {
      console.log('🤔 UNEXPECTED: Got status', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGoogleCallback();