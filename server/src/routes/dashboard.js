const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const dashboardRouter = express.Router();

dashboardRouter.get(
  '/dashboard',
  authenticate,
  authorize(ROLES.ADMIN),
  dashboardController.getAdminDashboard
);

module.exports = dashboardRouter;
