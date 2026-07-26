const { storageProvider } = require('../services/media.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS, RESOURCE_TYPES } = require('../constants');
const { ValidationError } = require('../errors');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Image file upload is required');
    }

    const savedFile = await storageProvider.saveFile(req.file, 'image');
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Image uploaded successfully',
      { file: savedFile }
    );
  } catch (error) {
    next(error);
  }
};

const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Resource file upload is required');
    }

    const savedFile = await storageProvider.saveFile(req.file, 'resource');

    // Infer resource type enum from mimetype
    let resourceType = RESOURCE_TYPES.OTHER;
    if (savedFile.mimetype.includes('pdf')) resourceType = RESOURCE_TYPES.PDF;
    else if (savedFile.mimetype.includes('zip')) resourceType = RESOURCE_TYPES.ZIP;
    else if (savedFile.mimetype.includes('image')) resourceType = RESOURCE_TYPES.IMAGE;
    else if (savedFile.mimetype.includes('text')) resourceType = RESOURCE_TYPES.CODE;

    const resourceData = {
      title: savedFile.originalname,
      type: resourceType,
      url: savedFile.url,
      filename: savedFile.filename,
      size: savedFile.formattedSize,
    };

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Resource file uploaded successfully',
      { resource: resourceData }
    );
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    await storageProvider.deleteFile(filename);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'File deleted successfully from storage'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadResource,
  deleteFile,
};
