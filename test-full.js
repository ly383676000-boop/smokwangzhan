// Complete test: login + upload
const fs = require('fs');
const path = require('path');

async function test() {
  // 1. Login
  console.log('1. Testing login...');
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'smok2024' })
  });
  const loginData = await loginRes.json();
  console.log('   Login:', loginRes.status, loginData.token ? 'Token OK' : 'NO TOKEN');
  
  if (!loginData.token) {
    console.log('   FAILED: Cannot login');
    return;
  }
  
  const token = loginData.token;
  
  // 2. Test upload - create multipart manually
  console.log('\n2. Testing upload via backend (port 3001)...');
  const testImg = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2);
  const body = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="image"; filename="test.png"\r\n` +
    `Content-Type: image/png\r\n\r\n` +
    testImg.toString('binary') + '\r\n' +
    `--${boundary}--\r\n`;
  
  const uploadRes = await fetch('http://localhost:3001/api/upload/image', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
  });
  const uploadData = await uploadRes.json();
  console.log('   Upload (backend):', uploadRes.status, JSON.stringify(uploadData));
  
  if (uploadRes.status === 200) {
    console.log('\n✅ Backend API is working correctly!');
    console.log('   Image URL:', uploadData.url);
    
    // Test if image is accessible
    const imgRes = await fetch('http://localhost:3001' + uploadData.url);
    console.log('   Image accessible:', imgRes.status === 200 ? 'YES' : 'NO');
    
    // 3. Test settings API
    console.log('\n3. Testing settings API...');
    const settingsRes = await fetch('http://localhost:3001/api/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const settingsData = await settingsRes.json();
    console.log('   Settings:', settingsRes.status, JSON.stringify(settingsData));
    
    // 4. Test products API
    console.log('\n4. Testing products API...');
    const productsRes = await fetch('http://localhost:3001/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsRes.json();
    console.log('   Products:', productsRes.status, 'Count:', Array.isArray(productsData) ? productsData.length : 'error');
    
    console.log('\n🎉 All backend APIs are working!');
  } else {
    console.log('\n❌ Upload failed with status:', uploadRes.status);
  }
}

test().catch(console.error);
