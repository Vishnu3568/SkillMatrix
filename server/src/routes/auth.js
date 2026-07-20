const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.registerStudent);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
