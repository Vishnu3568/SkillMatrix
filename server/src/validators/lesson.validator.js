const { z } = require('zod');
const { RESOURCE_TYPES } = require('../constants');

const resourceSchema = z.object({
  title: z
    .string({ required_error: 'Resource title is required' })
    .trim()
    .min(1, 'Resource title cannot be empty'),
  type: z
    .nativeEnum(RESOURCE_TYPES, { errorMap: () => ({ message: 'Invalid resource type' }) }),
  url: z
    .string({ required_error: 'Resource URL is required' })
    .trim()
    .url('Invalid resource URL format')
    .min(1, 'Resource URL cannot be empty'),
  size: z
    .string()
    .default('0 KB')
    .optional(),
});

const createLessonSchema = z.object({
  title: z
    .string({ required_error: 'Lesson title is required' })
    .trim()
    .min(1, 'Lesson title cannot be empty')
    .max(100, 'Lesson title cannot exceed 100 characters'),
  description: z
    .string({ required_error: 'Lesson description is required' })
    .trim()
    .min(1, 'Lesson description cannot be empty'),
  videoUrl: z
    .string({ required_error: 'Video URL is required' })
    .trim()
    .url('Invalid video URL format')
    .min(1, 'Video URL cannot be empty'),
  thumbnailUrl: z
    .string()
    .url('Invalid thumbnail URL format')
    .or(z.literal(''))
    .optional(),
  duration: z
    .number({ required_error: 'Duration in seconds is required' })
    .min(1, 'Duration must be at least 1 second'),
  isPreview: z
    .boolean()
    .default(false)
    .optional(),
  resources: z
    .array(resourceSchema)
    .default([])
    .optional(),
});

const updateLessonSchema = createLessonSchema.partial();

const reorderLessonsSchema = z.object({
  orderedIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID inside ordering list'), {
      required_error: 'orderedIds array is required',
    })
    .min(1, 'At least one lesson ID is required for reordering'),
});

module.exports = {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
};
