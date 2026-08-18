"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminCandidatesController_1 = require("../controllers/adminCandidatesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.requireAdminAuth, adminCandidatesController_1.AdminCandidatesController.listCandidates);
router.get('/:id', authMiddleware_1.requireAdminAuth, adminCandidatesController_1.AdminCandidatesController.getCandidateById);
exports.default = router;
