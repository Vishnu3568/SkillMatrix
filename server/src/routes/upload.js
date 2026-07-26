const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { uploadImage, uploadResource } = require('../services/media.service');
const validate = require('../middlewares/validate');
const { deleteFileParamSchema } = require('../validators/upload.validator');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const uploadRouter = express.Router();

uploadRouter.post(
  '/image',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadImage.single('file'),
  uploadController.uploadImage
);

uploadRouter.post(
  '/resource',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadResource.single('file'),
  uploadController.uploadResource
);

uploadRouter.delete(
  '/:filename',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(deleteFileParamSchema, 'params'),
  uploadController.deleteFile
);

module.exports = uploadRouter;
