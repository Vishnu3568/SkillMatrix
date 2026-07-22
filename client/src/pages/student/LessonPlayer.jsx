import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as lessonService from '../../services/lessonService';
import * as enrollmentService from '../../services/enrollmentService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import { useAuth } from '../../context/AuthContext';

export default function LessonPlayer() {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLessonDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await lessonService.getLesson(lessonSlug);
        if (response.success && response.data.lesson) {
          const l = response.data.lesson;
          setLesson(l);
          setCourse(l.courseId);

          // Load parent course syllabus lessons
          const syllabusRes = await lessonService.getLessons(l.courseId._id);
          if (syllabusRes.success) {
            setLessons(syllabusRes.data.lessons);
          }

          // Check enrollment status for logged in students
          if (isAuthenticated && currentUser?.role === 'student') {
            const enrollRes = await enrollmentService.getEnrollmentStatus(l.courseId._id);
            if (enrollRes.success) {
              setIsEnrolled(enrollRes.data.isEnrolled);
            }
          }
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('This lesson is locked. Please enroll in the course to unlock full access.');
        } else if (err.response?.status === 404) {
          setError('Lesson not found or syllabus is currently archived.');
        } else {
          setError('Failed to fetch lesson player content.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadLessonDetails();
  }, [lessonSlug, isAuthenticated, currentUser]);

  if (loading) return <Loader fullscreen message="Buffering video player..." />;

  if (error || !lesson || !course) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorState
          title="Curriculum Locked or Missing"
          message={error}
          retryAction={() => navigate(`/courses/${courseSlug || ''}`)}
        />
      </div>
    );
  }

  // Calculate Previous and Next lesson index pointers
  const activeIdx = lessons.findIndex((l) => l._id === lesson._id);
  const prevLesson = activeIdx > 0 ? lessons[activeIdx - 1] : null;
  const nextLesson = activeIdx >= 0 && activeIdx < lessons.length - 1 ? lessons[activeIdx + 1] : null;

  // Video embed url parser helper
  const getEmbedUrl = (url = '') => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (url.includes('vimeo.com')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? `https://player.vimeo.com/video/${match[1]}` : url;
      }
    } catch (_) {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Video Player Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Lesson Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Link to={`/courses/${course.slug}`} className="hover:text-indigo-400">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-slate-200">Lesson {String(activeIdx + 1).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">{lesson.title}</h1>
            {lesson.isPreview && <Badge variant="primary">Free Preview</Badge>}
            {isEnrolled && <Badge variant="success">Enrolled Student</Badge>}
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={lesson.videoUrl}
              controls
              poster={lesson.thumbnailUrl}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Lesson Navigation (Prev/Next buttons) */}
        <div className="flex justify-between gap-4 py-2">
          {prevLesson ? (
            <Link to={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}>
              <Button variant="outline" size="sm">
                ◀ Prev: Lesson {activeIdx}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link to={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}>
              <Button variant="primary" size="sm">
                Next: Lesson {activeIdx + 2} ▶
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Details & Resources Tabs */}
        <Card className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-200">About this lesson</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {lesson.description}
            </p>
          </div>

          <Divider />

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Resources & Attachments</h3>
            {lesson.resources && lesson.resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.resources.map((res, index) => (
                  <a
                    key={index}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/20 text-xs font-semibold text-slate-300"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[10px] uppercase text-indigo-400 block mb-0.5">
                        {res.type}
                      </span>
                      <span className="truncate block font-bold text-slate-200">{res.title}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] shrink-0">{res.size}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-semibold italic">
                No attachments uploaded for this lesson.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Sidebar Syllabus List Column */}
      <div className="space-y-6">
        <Card className="flex flex-col max-h-[80vh]">
          <div className="pb-3 border-b border-white/5">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">
              Course Syllabus
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
              {lessons.length} lessons • {Math.round(lessons.reduce((acc, l) => acc + l.duration, 0) / 60)} mins
            </span>
          </div>

          {/* Lessons list */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 mt-3 pr-1 space-y-0.5">
            {lessons.map((l, index) => {
              const isActive = l._id === lesson._id;
              const canAccess = currentUser?.role === 'admin' || isEnrolled || l.isPreview;
              
              return (
                <div 
                  key={l._id} 
                  className={`flex items-start justify-between py-3 px-2.5 rounded-lg text-xs ${
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                      : 'text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      Lesson {String(index + 1).padStart(2, '0')}
                    </span>
                    {canAccess ? (
                      <Link 
                        to={`/courses/${courseSlug}/lessons/${l.slug}`}
                        className={`font-semibold hover:text-indigo-400 transition-colors truncate block ${
                          isActive ? 'text-indigo-400' : 'text-slate-200'
                        }`}
                      >
                        {l.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-500 select-none truncate block cursor-not-allowed">
                        {l.title}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {Math.round(l.duration / 60)}m
                    </span>
                    {l.isPreview && <Badge variant="primary" className="text-[8px] px-1 py-0">Free</Badge>}
                    {!canAccess && <span className="text-slate-600" title="Locked">🔒</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Catalog return */}
        <div className="text-center">
          <Link 
            to={`/courses/${courseSlug}`}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            ← Back to Course Main page
          </Link>
        </div>
      </div>
    </div>
  );
}
