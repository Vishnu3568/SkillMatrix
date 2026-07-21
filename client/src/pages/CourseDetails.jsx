import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as courseService from '../services/courseService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Divider from '../components/common/Divider';
import { ROUTES } from '../constants/routes';

export default function CourseDetails() {
  const { slug } = useParams();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await courseService.getCourse(slug);
        if (response.success) {
          setCourse(response.data.course);
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
  }, [slug]);

  if (loading) return <Loader fullscreen message="Fetching course syllabus..." />;

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

  // Sample placeholder learning outcomes
  const outcomes = [
    'Gain comprehensive foundation principles in this domain.',
    'Build and structure real-world portfolio projects.',
    'Follow professional industry-standard architectural patterns.',
    'Implement caching, validation, and database security guidelines.',
  ];

  // Sample placeholder prerequisites
  const prerequisites = [
    'Basic syntax and programming logic familiarity.',
    'Local code environment setup and web browser utilities.',
    'No previous domain-specific advanced knowledge required.',
  ];

  // Placeholder syllabus lessons
  const placeholderLessons = [
    { title: 'Introduction & Course Syllabus Overview', duration: '12 mins' },
    { title: 'Environment Setup and Core Installation Steps', duration: '25 mins' },
    { title: 'Building the First Functional Blueprint', duration: '40 mins' },
    { title: 'Advanced Concepts and Structural Refactoring', duration: '55 mins' },
  ];

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
              <div className="h-full w-full flex items-center justify-center text-slate-600 font-extrabold text-2xl select-none bg-slate-950">
                📚 {course.category}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                {course.category}
              </span>
              <span className="text-slate-600 font-bold select-none">•</span>
              <Badge variant="primary">
                {course.level}
              </Badge>
              {course.status !== 'published' && (
                <Badge variant="warning" className="uppercase">
                  {course.status}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {course.title}
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
              {course.shortDescription}
            </p>

            <div className="flex items-center gap-6 text-xs sm:text-sm text-slate-400 font-semibold pt-2">
              <span>⏳ {course.estimatedDuration} minutes</span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <Avatar name={course.createdBy?.fullName} size="sm" />
                <span className="text-slate-300 font-bold">{course.createdBy?.fullName || 'Academic Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Course Description */}
          <Card>
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              📄 Course Description
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </Card>

          {/* 3. Learning Outcomes */}
          <Card>
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              🎯 Learning Outcomes
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2.5 text-slate-300 text-sm">
                  <span className="text-indigo-400 shrink-0 select-none">✔</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* 4. Prerequisites */}
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

          {/* 5. Lesson List (Empty Placeholder) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                📖 Curriculum Syllabus
              </h2>
              <Badge variant="info">4 Lessons</Badge>
            </div>
            
            {/* Structured Lesson Rows (Disabled) */}
            <div className="divide-y divide-white/5">
              {placeholderLessons.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 text-slate-400 select-none">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-bold w-6">0{index + 1}</span>
                    <span className="text-sm font-semibold hover:text-slate-300 cursor-not-allowed">
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{lesson.duration}</span>
                    <span className="text-xs text-slate-600">🔒</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-[10px] text-center text-slate-500 font-semibold leading-relaxed pt-4 border-t border-white/5">
              * Lessons are currently locked. Lesson playback and interactive video playback screens will be unlocked in **Phase 5**.
            </p>
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* 6. Instructor placeholder */}
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

          {/* 7. Enrollment CTA */}
          <Card className="space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Enrollment Desk</h3>
            
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

            <Divider className="my-0" />

            <Button variant="primary" className="w-full justify-center" disabled>
              Enroll Now (Scheduled)
            </Button>
            <p className="text-[10px] text-slate-500 text-center font-semibold leading-relaxed">
              * Enrollment parameters and student registers will be fully configured during **Phase 5**.
            </p>
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
    </div>
  );
}
