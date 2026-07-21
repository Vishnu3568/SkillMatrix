const mongoose = require('mongoose');
const { generateSlug } = require('../utilities');
const { COURSE_STATUS, COURSE_LEVELS } = require('../constants');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: Object.values(COURSE_LEVELS),
      default: COURSE_LEVELS.BEGINNER,
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Estimated duration must be at least 1 minute'],
    },
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
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

// We need a case-insensitive unique index for slug to prevent duplicate courses
courseSchema.index({ slug: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Pre-save hook: auto-generate unique slug if title has changed
courseSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    const slugCandidate = generateSlug(this.title);
    let uniqueSlug = slugCandidate;
    let count = 1;

    const Course = mongoose.model('Course');
    while (await Course.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${slugCandidate}-${count}`;
      count += 1;
    }
    this.slug = uniqueSlug;
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
