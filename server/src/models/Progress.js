const mongoose = require('mongoose');
const { PROGRESS_STATUS } = require('../constants');

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson reference is required'],
    },
    status: {
      type: String,
      enum: Object.values(PROGRESS_STATUS),
      default: PROGRESS_STATUS.NOT_STARTED,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: [0, 'Progress percentage cannot be negative'],
      max: [100, 'Progress percentage cannot exceed 100%'],
    },
    watchTimeSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Watch time cannot be negative'],
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique student progress per lesson
progressSchema.index(
  { studentId: 1, lessonId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
