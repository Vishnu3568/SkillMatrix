const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboardData();
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Admin dashboard analytics retrieved successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
};
