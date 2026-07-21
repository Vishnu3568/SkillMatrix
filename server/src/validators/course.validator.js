const { z } = require('zod');
const { COURSE_LEVELS } = require('../constants');

const createCourseSchema = z.object({
  title: z
    .string({ required_error: 'Course title is required' })
    .trim()
    .min(1, 'Course title cannot be empty')
    .max(100, 'Course title cannot exceed 100 characters'),
  shortDescription: z
    .string({ required_error: 'Short description is required' })
    .trim()
    .min(1, 'Short description cannot be empty')
    .max(300, 'Short description cannot exceed 300 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  thumbnailUrl: z
    .string()
    .url('Invalid thumbnail URL')
    .or(z.literal(''))
    .optional(),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty'),
  level: z
    .nativeEnum(COURSE_LEVELS, { errorMap: () => ({ message: 'Invalid level value' }) })
    .default(COURSE_LEVELS.BEGINNER),
  estimatedDuration: z
    .number({ required_error: 'Estimated duration is required' })
    .min(1, 'Estimated duration must be at least 1 minute'),
  tags: z
    .array(z.string().trim())
    .default([])
    .optional(),
});

const updateCourseSchema = createCourseSchema.partial();

module.exports = {
  createCourseSchema,
  updateCourseSchema,
};
