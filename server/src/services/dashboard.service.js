const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const { ROLES, COURSE_STATUS, ENROLLMENT_STATUS, PROGRESS_STATUS } = require('../constants');

/**
 * Calculates platform overview summary statistics.
 */
const getDashboardSummary = async () => {
  const [
    totalUsers,
    totalStudents,
    totalAdmins,
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    totalLessons,
    publishedLessons,
    totalEnrollments,
    activeEnrollments,
    cancelledEnrollments,
    completedEnrollments,
    totalProgressRecords,
    completedLessons,
    avgProgressAggregation,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.STUDENT }),
    User.countDocuments({ role: ROLES.ADMIN }),

    Course.countDocuments({ isDeleted: false }),
    Course.countDocuments({ status: COURSE_STATUS.PUBLISHED, isDeleted: false }),
    Course.countDocuments({ status: COURSE_STATUS.DRAFT, isDeleted: false }),
    Course.countDocuments({ status: COURSE_STATUS.ARCHIVED, isDeleted: false }),

    Lesson.countDocuments({ isDeleted: false }),
    Lesson.countDocuments({ status: COURSE_STATUS.PUBLISHED, isDeleted: false }),

    Enrollment.countDocuments({ isDeleted: false }),
    Enrollment.countDocuments({ status: ENROLLMENT_STATUS.ACTIVE, isDeleted: false }),
    Enrollment.countDocuments({ status: ENROLLMENT_STATUS.CANCELLED, isDeleted: false }),
    Enrollment.countDocuments({ status: ENROLLMENT_STATUS.COMPLETED, isDeleted: false }),

    Progress.countDocuments({ isDeleted: false }),
    Progress.countDocuments({ status: PROGRESS_STATUS.COMPLETED, isDeleted: false }),

    Progress.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, avgPercent: { $avg: '$progressPercent' } } },
    ]),
  ]);

  const averageCompletionPercentage = avgProgressAggregation[0]
    ? Math.round(avgProgressAggregation[0].avgPercent)
    : 0;

  return {
    totalUsers,
    totalStudents,
    totalAdmins,
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    totalLessons,
    publishedLessons,
    totalEnrollments,
    activeEnrollments,
    cancelledEnrollments,
    completedEnrollments,
    totalProgressRecords,
    completedLessons,
    averageCompletionPercentage,
  };
};

/**
 * Retrieves Top 5 Most Enrolled Courses with average completion rates.
 */
const getTopEnrolledCourses = async () => {
  const aggregated = await Enrollment.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$courseId', enrollmentCount: { $sum: 1 } } },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    { $match: { 'course.isDeleted': false } },
    {
      $lookup: {
        from: 'progresses',
        localField: '_id',
        foreignField: 'courseId',
        as: 'progressRecords',
      },
    },
    {
      $project: {
        _id: '$course._id',
        title: '$course.title',
        slug: '$course.slug',
        thumbnailUrl: '$course.thumbnailUrl',
        category: '$course.category',
        level: '$course.level',
        enrollmentCount: 1,
        completionPercentage: {
          $cond: [
            { $gt: [{ $size: '$progressRecords' }, 0] },
            { $round: [{ $avg: '$progressRecords.progressPercent' }, 0] },
            0,
          ],
        },
      },
    },
  ]);

  // Fallback: If no enrollments exist yet, return recent published courses
  if (aggregated.length === 0) {
    const published = await Course.find({ status: COURSE_STATUS.PUBLISHED, isDeleted: false })
      .select('title slug thumbnailUrl category level')
      .limit(5)
      .lean();

    return published.map((c) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category,
      level: c.level,
      enrollmentCount: 0,
      completionPercentage: 0,
    }));
  }

  return aggregated;
};

/**
 * Retrieves newest registered student accounts with activity statistics.
 */
const getNewestStudents = async () => {
  const students = await User.find({ role: ROLES.STUDENT })
    .select('fullName email avatarUrl createdAt lastLoginAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const studentDetails = await Promise.all(
    students.map(async (student) => {
      const enrollmentCount = await Enrollment.countDocuments({
        studentId: student._id,
        status: ENROLLMENT_STATUS.ACTIVE,
        isDeleted: false,
      });

      const completedCount = await Progress.countDocuments({
        studentId: student._id,
        status: PROGRESS_STATUS.COMPLETED,
        isDeleted: false,
      });

      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
        enrollmentCount,
        completedCount,
      };
    })
  );

  return studentDetails;
};

/**
 * Retrieves recent enrollment logs.
 */
const getRecentEnrollments = async () => {
  const enrollments = await Enrollment.find({ isDeleted: false })
    .populate('studentId', 'fullName email avatarUrl')
    .populate('courseId', 'title slug category thumbnailUrl')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return enrollments.filter((e) => e.studentId && e.courseId);
};

/**
 * Compiles real-time activity feed timeline records (Max 20).
 */
const getSystemActivityFeed = async () => {
  const [recentUsers, recentCourses, recentEnrollments, recentCompletions] = await Promise.all([
    User.find()
      .select('fullName role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Course.find({ isDeleted: false })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Enrollment.find({ isDeleted: false })
      .populate('studentId', 'fullName')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Progress.find({ status: PROGRESS_STATUS.COMPLETED, isDeleted: false })
      .populate('studentId', 'fullName')
      .populate('lessonId', 'title')
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const activities = [];

  recentUsers.forEach((u) => {
    activities.push({
      id: `user-${u._id}`,
      type: 'user_registered',
      title: 'New Account Registered',
      description: `${u.fullName} registered as a ${u.role}.`,
      timestamp: u.createdAt,
      icon: '👤',
    });
  });

  recentCourses.forEach((c) => {
    activities.push({
      id: `course-${c._id}`,
      type: 'course_created',
      title: `Course ${c.status === COURSE_STATUS.PUBLISHED ? 'Published' : 'Created'}`,
      description: `Course "${c.title}" was added to the platform.`,
      timestamp: c.createdAt,
      icon: '📚',
    });
  });

  recentEnrollments.forEach((e) => {
    if (e.studentId && e.courseId) {
      activities.push({
        id: `enroll-${e._id}`,
        type: 'student_enrolled',
        title: 'New Student Enrollment',
        description: `${e.studentId.fullName} enrolled in "${e.courseId.title}".`,
        timestamp: e.createdAt,
        icon: '🎓',
      });
    }
  });

  recentCompletions.forEach((p) => {
    if (p.studentId && p.lessonId) {
      activities.push({
        id: `comp-${p._id}`,
        type: 'lesson_completed',
        title: 'Lesson Completed',
        description: `${p.studentId.fullName} completed "${p.lessonId.title}".`,
        timestamp: p.completedAt || p.updatedAt,
        icon: '✅',
      });
    }
  });

  // Sort unified feed descending by timestamp and limit to 20
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return activities.slice(0, 20);
};

/**
 * Master aggregation query returning complete Admin Dashboard analytics payload.
 */
const getAdminDashboardData = async () => {
  const [summary, topCourses, newestStudents, recentEnrollments, activityFeed] =
    await Promise.all([
      getDashboardSummary(),
      getTopEnrolledCourses(),
      getNewestStudents(),
      getRecentEnrollments(),
      getSystemActivityFeed(),
    ]);

  return {
    summary,
    topCourses,
    newestStudents,
    recentEnrollments,
    activityFeed,
  };
};

module.exports = {
  getDashboardSummary,
  getTopEnrolledCourses,
  getNewestStudents,
  getRecentEnrollments,
  getSystemActivityFeed,
  getAdminDashboardData,
};
