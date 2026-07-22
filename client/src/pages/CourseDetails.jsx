import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as courseService from '../services/courseService';
import * as lessonService from '../services/lessonService';
import * as enrollmentService from '../services/enrollmentService';
import * as progressService from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Divider from '../components/common/Divider';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import useToast from '../hooks/useToast';
import { ROUTES } from '../constants/routes';

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, currentUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Enrollment confirmation dialog states
  const [enrollConfirmOpen, setEnrollConfirmOpen] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await courseService.getCourse(slug);
        if (response.success && response.data.course) {
          const c = response.data.course;
          setCourse(c);
          
          // Fetch real syllabus lessons
          const lessonsRes = await lessonService.getLessons(c._id);
          if (lessonsRes.success) {
            setLessons(lessonsRes.data.lessons);
          }

          // Check student enrollment status and progress metrics if logged in
          if (isAuthenticated && currentUser?.role === 'student') {
            const enrollRes = await enrollmentService.getEnrollmentStatus(c._id);
            if (enrollRes.success && enrollRes.data.isEnrolled) {
              setIsEnrolled(true);

              const progressRes = await progressService.getCourseProgress(c._id);
              if (progressRes.success) {
                setCourseProgress(progressRes.data);
              }
            } else {
              setIsEnrolled(false);
            }
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Course not found or has been archived.');
        } else {
          setError('Failed to fetch course details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [slug, isAuthenticated, currentUser]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrollLoading(true);
    try {
      const response = await enrollmentService.enrollInCourse(course._id);
      if (response.success) {
        setIsEnrolled(true);
        toast.success('Successfully enrolled in course!');
        setEnrollConfirmOpen(false);

        // Load initial course progress after enrollment
        const progressRes = await progressService.getCourseProgress(course._id);
        if (progressRes.success) {
          setCourseProgress(progressRes.data);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to enroll in course';
      toast.error(msg);
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) return <Loader fullscreen message="Fetching course details..." />;

  if (error || !course) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load course"
          message={error}
          retryAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const outcomes = [
    'Gain comprehensive foundation principles in this domain.',
    'Build and structure real-world portfolio projects.',
    'Follow professional industry-standard architectural patterns.',
    'Implement caching, validation, and database security guidelines.',
  ];

  const prerequisites = [
    'Basic syntax and programming logic familiarity.',
    'Local code environment setup and web browser utilities.',
    'No previous domain-specific advanced knowledge required.',
  ];

  const targetLessonSlug =
    courseProgress?.nextLesson?.slug ||
    courseProgress?.lastLesson?.slug ||
    lessons[0]?.slug;

  const progressMap = courseProgress?.progressMap || {};

  return (
    <div className="space-y-8">
      {/* 1. Course Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 sm:p-8 border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          {/* Thumbnail */}
          <div className="h-44 sm:h-52 w-full md:w-80 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shrink-0">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-700 font-black text-3xl select-none">
                📚 {course.category}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-black text-indigo-400">
                {course.category}
              </span>
              <Badge variant="primary" className="uppercase font-bold">
                {course.level}
              </Badge>
              <Badge variant={course.status === 'published' ? 'success' : 'warning'} className="uppercase font-bold">
                {course.status}
              </Badge>
              {isEnrolled && (
                <Badge variant="success" className="uppercase font-bold">
                  ✓ Enrolled
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {course.shortDescription}
            </p>

            {/* Enrolled Progress Bar */}
            {isEnrolled && courseProgress && (
              <div className="pt-2 max-w-md">
                <ProgressBar
                  value={courseProgress.completionPercentage}
                  showLabel
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-center md:justify-start gap-6 text-xs text-slate-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <span>⏱ Duration:</span>
                <strong className="text-slate-200">{course.estimatedDuration} mins</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📖 Syllabus:</span>
                <strong className="text-slate-200">{lessons.length} lessons</strong>
              </div>
              {isEnrolled && courseProgress && (
                <div className="flex items-center gap-1.5">
                  <span>✅ Completed:</span>
                  <strong className="text-emerald-400">
                    {courseProgress.completedLessons} / {courseProgress.totalLessons}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Description */}
          <Card>
            <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              📝 Detailed Description
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              🎯 Learning Outcomes
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2.5 text-slate-300 text-sm">
                  <span className="text-indigo-400 font-bold select-none">✓</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Prerequisites */}
          <Card>
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              🛠 Prerequisites
            </h2>
            <ul className="space-y-2.5">
              {prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2.5 text-slate-300 text-sm">
                  <span className="text-slate-500 font-bold select-none">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Lesson List */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                📖 Curriculum Syllabus
              </h2>
              <Badge variant="info">{lessons.length} Lessons</Badge>
            </div>
            
            {lessons.length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold italic text-center py-6">
                No lessons added to this course curriculum yet.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {lessons.map((lesson, index) => {
                  const canAccess = currentUser?.role === 'admin' || isEnrolled || lesson.isPreview;
                  const lessonProg = progressMap[lesson._id.toString()];
                  const isCompleted = lessonProg?.status === 'completed';

                  return (
                    <div key={lesson._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 text-slate-300">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-slate-500 font-bold w-6">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {canAccess ? (
                          <Link 
                            to={`/courses/${course.slug}/lessons/${lesson.slug}`}
                            className={`text-sm font-semibold transition-colors truncate ${
                              isCompleted ? 'text-emerald-400 font-bold' : 'hover:text-indigo-400'
                            }`}
                          >
                            {isCompleted ? `✓ ${lesson.title}` : lesson.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500 select-none truncate">
                            {lesson.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-500">
                          {Math.round(lesson.duration / 60)} mins
                        </span>
                        {lesson.isPreview && (
                          <Badge variant="primary" className="text-[9px]">Preview</Badge>
                        )}
                        {isCompleted ? (
                          <Badge variant="success" className="text-[9px]">Completed ✓</Badge>
                        ) : !canAccess ? (
                          <Badge variant="danger" className="text-[9px]">Locked 🔒</Badge>
                        ) : (
                          <Badge variant="info" className="text-[9px]">Open 🔓</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Instructor Profile */}
          <Card className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Instructor Profile</h3>
            <div className="flex items-center gap-3.5">
              <Avatar name={course.createdBy?.fullName} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  {course.createdBy?.fullName || 'Academic Instructor'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Course Coordinator • SkillMatrix
                </p>
              </div>
            </div>
          </Card>

          {/* Enrollment & Progress Desk */}
          <Card className="space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {isEnrolled ? 'Course Progress' : 'Enrollment Desk'}
            </h3>
            
            {isEnrolled && courseProgress ? (
              <div className="space-y-4">
                <ProgressBar value={courseProgress.completionPercentage} showLabel />
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>Lessons Completed</span>
                  <span className="text-emerald-400 font-bold">
                    {courseProgress.completedLessons} / {courseProgress.totalLessons}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="font-bold text-slate-200">{course.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Skill Level</span>
                  <span className="font-bold text-slate-200">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="font-bold text-slate-200">{course.estimatedDuration} mins</span>
                </div>
              </div>
            )}

            <Divider className="my-0" />

            {/* Dynamic CTA */}
            {!isAuthenticated ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Log in to Enroll
              </Button>
            ) : currentUser?.role === 'admin' ? (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => navigate(`/admin/courses/${course._id}/lessons`)}
              >
                Manage Course Syllabus →
              </Button>
            ) : isEnrolled ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  if (targetLessonSlug) {
                    navigate(`/courses/${course.slug}/lessons/${targetLessonSlug}`);
                  } else {
                    toast.info('No lessons uploaded for this course yet');
                  }
                }}
              >
                Continue Learning →
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => setEnrollConfirmOpen(true)}
              >
                Enroll Now
              </Button>
            )}
          </Card>

          {/* Return Links */}
          <div className="text-center">
            <Link 
              to={ROUTES.COURSES} 
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              ← Return to Course Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Enroll Confirmation Dialog */}
      <ConfirmDialog
        isOpen={enrollConfirmOpen}
        onClose={() => setEnrollConfirmOpen(false)}
        onConfirm={handleEnroll}
        loading={enrollLoading}
        title="Confirm Course Enrollment"
        message={`Are you sure you want to enroll in "${course.title}"? This will grant full access to all published lessons in this course.`}
        confirmText="Confirm Enrollment"
      />
    </div>
  );
}
