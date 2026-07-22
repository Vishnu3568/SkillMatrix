const { z } = require('zod');

const courseIdParamSchema = z.object({
  courseId: z
    .string({ required_error: 'Course ID parameter is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Course ID format'),
});

module.exports = {
  courseIdParamSchema,
};
