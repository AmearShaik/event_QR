const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`===================================================`);
  console.log(` Graduation Day 2026 QR Backend Server Active`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` Network: http://192.168.1.19:${PORT}`);
  console.log(` Health:  http://192.168.1.19:${PORT}/health`);
  console.log(`===================================================`);
});
