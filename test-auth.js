// First login to get token
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'smok2024' })
}).then(r => r.json()).then(data => {
  console.log('Login success, token:', data.token ? 'YES' : 'NO');
  
  // Then test /api/auth/me
  return fetch('http://localhost:3001/api/auth/me', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
}).then(r => {
  console.log('/api/auth/me status:', r.status);
  return r.json();
}).then(d => console.log('/api/auth/me response:', JSON.stringify(d)))
.catch(e => console.log('Error:', e.message));
