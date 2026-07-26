const { z } = require('zod');
const { RESOURCE_TYPES } = require('../constants');

const deleteFileParamSchema = z.object({
  filename: z
    .string({ required_error: 'Filename parameter is required' })
    .min(1, 'Filename cannot be empty')
    .max(255, 'Filename length invalid'),
});

const externalResourceSchema = z.object({
  title: z
    .string({ required_error: 'Resource title is required' })
    .trim()
    .min(1, 'Resource title cannot be empty'),
  type: z
    .nativeEnum(RESOURCE_TYPES, { errorMap: () => ({ message: 'Invalid resource type' }) })
    .default(RESOURCE_TYPES.LINK),
  url: z
    .string({ required_error: 'Resource URL is required' })
    .url('Invalid resource URL'),
  size: z.string().optional().default('External Link'),
});

module.exports = {
  deleteFileParamSchema,
  externalResourceSchema,
};
