import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Graduation Day 2026 Backend Running on port ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});
