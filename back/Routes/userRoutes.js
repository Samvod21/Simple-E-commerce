const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../Controllers/userController');
const { protect } = require('../Middleware/authMidddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getProfile);

module.exports = router;