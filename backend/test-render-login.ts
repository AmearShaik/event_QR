async function testLogin() {
  const url = 'https://graduation-day-backend-yy69.onrender.com/api/auth/login';
  console.log('Posting to', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin@graduation.edu',
      password: 'admin@2026',
    }),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testLogin();
