"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
app_1.default.listen(PORT, HOST, () => {
    console.log(`===================================================`);
    console.log(` Graduation Day 2026 Backend Running on port ${PORT}`);
    console.log(` Local:   http://localhost:${PORT}/api`);
    console.log(` Network: http://192.168.1.19:${PORT}/api`);
    console.log(` Health:  http://192.168.1.19:${PORT}/health`);
    console.log(`===================================================`);
});
exports.default = app_1.default;
