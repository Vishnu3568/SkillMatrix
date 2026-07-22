const mongoose = require('mongoose');
const { generateSlug } = require('../utilities');
const { COURSE_STATUS, RESOURCE_TYPES } = require('../constants');

const resourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Resource title is required'], 
    trim: true 
  },
  type: { 
    type: String, 
    enum: Object.values(RESOURCE_TYPES), 
    required: [true, 'Resource type is required'] 
  },
  url: { 
    type: String, 
    required: [true, 'Resource URL is required'], 
    trim: true 
  },
  size: { 
    type: String, 
    default: '0 KB' 
  },
});

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Lesson description is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
    },
    resources: {
      type: [resourceSchema],
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

// Unique lesson order within the same active course
lessonSchema.index(
  { courseId: 1, order: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Unique slug within the same active course (case-insensitive)
lessonSchema.index(
  { courseId: 1, slug: 1 },
  { 
    unique: true, 
    collation: { locale: 'en', strength: 2 },
    partialFilterExpression: { isDeleted: false }
  }
);

// Pre-save hook: auto-generate unique slug within the course context
lessonSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    const slugCandidate = generateSlug(this.title);
    let uniqueSlug = slugCandidate;
    let count = 1;

    const Lesson = mongoose.model('Lesson');
    while (
      await Lesson.findOne({
        courseId: this.courseId,
        slug: uniqueSlug,
        _id: { $ne: this._id },
        isDeleted: false,
      })
    ) {
      uniqueSlug = `${slugCandidate}-${count}`;
      count += 1;
    }
    this.slug = uniqueSlug;
  }
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
