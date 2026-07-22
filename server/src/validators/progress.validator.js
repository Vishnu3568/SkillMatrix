const { z } = require('zod');

const lessonIdParamSchema = z.object({
  lessonId: z
    .string({ required_error: 'Lesson ID parameter is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Lesson ID format'),
});

const courseIdParamSchema = z.object({
  courseId: z
    .string({ required_error: 'Course ID parameter is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Course ID format'),
});

const updateProgressSchema = z.object({
  watchTimeSeconds: z
    .number()
    .min(0, 'Watch time cannot be negative')
    .optional(),
  progressPercent: z
    .number()
    .min(0, 'Progress percentage cannot be less than 0')
    .max(100, 'Progress percentage cannot exceed 100')
    .optional(),
});

module.exports = {
  lessonIdParamSchema,
  courseIdParamSchema,
  updateProgressSchema,
};
