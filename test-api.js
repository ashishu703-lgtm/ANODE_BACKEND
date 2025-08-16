const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Automatic Review System API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ User Registration:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ User already exists (expected for repeated tests)');
      } else {
        console.log('❌ Registration Error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 3: User Login
    console.log('3. Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };
    
    let authToken = '';
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      console.log('✅ User Login:', { message: loginResponse.data.message, user: loginResponse.data.data.user.username });
      authToken = loginResponse.data.data.token;
    } catch (error) {
      console.log('❌ Login Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Admin Login
    console.log('4. Testing Admin Login...');
    const adminLoginData = {
      email: 'admin@automaticreview.com',
      password: 'Admin123!'
    };
    
    let adminToken = '';
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, adminLoginData);
      console.log('✅ Admin Login:', { message: adminLoginResponse.data.message, user: adminLoginResponse.data.data.user.username });
      adminToken = adminLoginResponse.data.data.token;
    } catch (error) {
      console.log('❌ Admin Login Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Submit Review (requires authentication)
    console.log('5. Testing Review Submission...');
    if (authToken) {
      const reviewData = {
        title: 'Test Review Submission',
        content: 'This is a test review content for testing the API.',
        category: 'academic',
        priority: 'medium'
      };
      
      try {
        const reviewResponse = await axios.post(`${BASE_URL}/reviews/submit`, reviewData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Review Submission:', reviewResponse.data);
      } catch (error) {
        console.log('❌ Review Submission Error:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ Skipping review submission - no auth token');
    }
    console.log('');

    // Test 6: Get User Reviews
    console.log('6. Testing Get User Reviews...');
    if (authToken) {
      try {
        const reviewsResponse = await axios.get(`${BASE_URL}/reviews`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Get User Reviews:', { count: reviewsResponse.data.data.reviews.length });
      } catch (error) {
        console.log('❌ Get Reviews Error:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ Skipping get reviews - no auth token');
    }
    console.log('');

    // Test 7: Admin - Get All Reviews
    console.log('7. Testing Admin - Get All Reviews...');
    if (adminToken) {
      try {
        const adminReviewsResponse = await axios.get(`${BASE_URL}/admin/reviews`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Get All Reviews:', { count: adminReviewsResponse.data.data.reviews.length });
      } catch (error) {
        console.log('❌ Admin Get Reviews Error:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ Skipping admin reviews - no admin token');
    }
    console.log('');

    // Test 8: Admin - Get All Users
    console.log('8. Testing Admin - Get All Users...');
    if (adminToken) {
      try {
        const adminUsersResponse = await axios.get(`${BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Get All Users:', { count: adminUsersResponse.data.data.users.length });
      } catch (error) {
        console.log('❌ Admin Get Users Error:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ Skipping admin users - no admin token');
    }
    console.log('');

    console.log('🎉 API Testing Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
