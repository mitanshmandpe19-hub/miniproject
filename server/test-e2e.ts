import fs from 'fs';
import path from 'path';

const API_BASE = 'http://127.0.0.1:3001/api';

async function runTests() {
  console.log('🧪 Running Comprehensive Authentication & Persistence End-to-End Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'API Health Check Endpoint');

    // 2. Signup with empty fields
    const emptySignupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    const emptySignupData = await emptySignupRes.json();
    assert(
      emptySignupRes.status === 400 && Boolean(emptySignupData.error),
      'Signup Rejection on Empty Fields',
      emptySignupData.error
    );

    // 3. Signup with short password (< 8 chars)
    const shortPassRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_short@example.com', password: '123' }),
    });
    const shortPassData = await shortPassRes.json();
    assert(
      shortPassRes.status === 400 && shortPassData.error.includes('8 characters'),
      'Signup Rejection on Short Password (<8 chars)',
      shortPassData.error
    );

    // 4. Signup with invalid email format
    const invalidEmailRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail', password: 'ValidPassword123' }),
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(
      invalidEmailRes.status === 400 && invalidEmailData.error.includes('valid email'),
      'Signup Rejection on Invalid Email Format',
      invalidEmailData.error
    );

    // 5. Successful Signup
    const testEmail = `dev_${Date.now()}@example.com`;
    const testPass = 'SuperSecret123!';
    const testName = 'Alex Rivers';

    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass, name: testName }),
    });
    const signupData = await signupRes.json();
    assert(
      signupRes.status === 201 && signupData.success && Boolean(signupData.token) && signupData.user.email === testEmail,
      'Successful User Registration with JWT Issuance',
      `User ID: ${signupData.user?.id}`
    );

    const userToken = signupData.token;

    // 6. Duplicate Signup Rejection
    const dupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'AnotherPassword123' }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 409 && dupData.error.includes('already exists'),
      'Duplicate Email Registration Rejection (409 Conflict)',
      dupData.error
    );

    // 7. Login with Wrong Password
    const wrongPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword999' }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert(
      wrongPassRes.status === 401 && wrongPassData.error.includes('Incorrect password'),
      'Login Rejection on Incorrect Password',
      wrongPassData.error
    );

    // 8. Login with Non-existent Email
    const noUserRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_user_999@example.com', password: 'ValidPassword123' }),
    });
    const noUserData = await noUserRes.json();
    assert(
      noUserRes.status === 401 && noUserData.error.includes('No account found'),
      'Login Rejection on Non-Existent Account',
      noUserData.error
    );

    // 9. Successful Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass }),
    });
    const loginData = await loginRes.json();
    assert(
      loginRes.status === 200 && loginData.success && Boolean(loginData.token) && loginData.user.name === testName,
      'Successful User Login and Token Retrieval',
      `Token issued: ${loginData.token.substring(0, 20)}...`
    );

    // 10. Profile Verification via GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.success && meData.user.email === testEmail,
      'Protected Profile Lookup via JWT Bearer Token (/api/auth/me)',
      `Name: ${meData.user?.name}`
    );

    // 11. Database Persistence Verification on Disk
    const usersFile = path.join(process.cwd(), 'server', 'data', 'users.json');
    const rawData = fs.readFileSync(usersFile, 'utf-8');
    const diskUsers = JSON.parse(rawData);
    const persistedUser = diskUsers.find((u: any) => u.email === testEmail);

    assert(
      Boolean(persistedUser && persistedUser.passwordHash.startsWith('$2b$10$')),
      'Secure Bcrypt Hashing & File Database Persistence',
      `Hash: ${persistedUser?.passwordHash.substring(0, 20)}... (No plain-text)`
    );

    // 12. Logout Endpoint
    const logoutRes = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200 && logoutData.success, 'Logout Session Termination (/api/auth/logout)');

    console.log(`\n========================================`);
    console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
