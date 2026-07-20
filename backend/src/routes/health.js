const express = require('express');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  const healthData = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  return sendSuccess(res, 200, 'SkillMatrix API is healthy', healthData);
});

module.exports = router;
