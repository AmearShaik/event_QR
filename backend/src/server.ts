import app from './app';

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`===================================================`);
  console.log(` Graduation Day 2026 Backend Running on port ${PORT}`);
  console.log(` Local:   http://localhost:${PORT}/api`);
  console.log(` Network: http://192.168.1.19:${PORT}/api`);
  console.log(` Health:  http://192.168.1.19:${PORT}/health`);
  console.log(`===================================================`);
});

export default app;
