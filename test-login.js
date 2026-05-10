fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'smok2024' })
}).then(r => r.json()).then(d => {
  console.log('Success:', d.success);
  console.log('Token:', d.token ? 'Got token!' : 'No token');
  if (d.token) console.log('Token length:', d.token.length);
}).catch(e => console.log('Error:', e.message));
