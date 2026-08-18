const express = require('express');
const { verifyCandidatePublic, registerCandidatePublic, studentLogin } = require('../controllers/candidateController');

const router = express.Router();

router.post('/login', studentLogin);
router.get('/verify/:studentId', verifyCandidatePublic);
router.post('/register', registerCandidatePublic);

module.exports = router;
