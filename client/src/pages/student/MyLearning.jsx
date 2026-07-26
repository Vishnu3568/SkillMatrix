import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as enrollmentService from '../../services/enrollmentService';
import * as progressService from '../../services/progressService';
import * as courseService from '../../services/courseService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
import CourseGrid from '../../components/common/CourseGrid';
import Pagination from '../../components/common/Pagination';
import useToast from '../../hooks/useToast';

export default function MyLearning() {
  const navigate = useNavigate();
  const toast = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Discovery sections data
  const [recentLearning, setRecentLearning] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [popular, setPopular] = useState([]);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await enrollmentService.getMyLearning({
        search,
        page,
        limit: 6,
      });

      if (response.success) {
        const fetchedEnrollments = response.data.enrollments;
        setEnrollments(fetchedEnrollments);
        setTotalPages(response.data.totalPages);

        const progressResults = await Promise.all(
          fetchedEnrollments.map(async (item) => {
            if (!item.courseId?._id) return { courseId: null, data: null };
            try {
              const pRes = await progressService.getCourseProgress(item.courseId._id);
              return { courseId: item.courseId._id, data: pRes.data };
            } catch (_) {
              return { courseId: item.courseId._id, data: null };
            }
          })
        );

        const newMap = {};
        progressResults.forEach((res) => {
          if (res.courseId && res.data) {
            newMap[res.courseId] = res.data;
          }
        });
        setProgressMap(newMap);
      }
    } catch (err) {
      toast.error('Failed to load your enrolled courses');
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  const loadDiscoveryData = useCallback(async () => {
    try {
      const [rLearningRes, recRes, popRes] = await Promise.all([
        courseService.getRecentLearning().catch(() => null),
        courseService.getRecommendedCourses(6).catch(() => null),
        courseService.getPopularCourses(6).catch(() => null),
      ]);

      if (rLearningRes?.success) setRecentLearning(rLearningRes.data);
      if (recRes?.success) setRecommended(recRes.data.courses || []);
      if (popRes?.success) setPopular(popRes.data.courses || []);
    } catch (_) {
      // Non-blocking discovery load catch
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  useEffect(() => {
    loadDiscoveryData();
  }, [loadDiscoveryData]);

  const continueTarget = recentLearning?.continueLearning;

  return (
    <div className="space-y-10">
      <PageHeader
        title="My Learning Portal"
        subtitle="Manage, track, and discover interactive learning paths."
        action={
          <Button variant="outline" onClick={() => navigate('/courses')}>
            🔍 Browse Full Catalog
          </Button>
        }
      />

      {/* 1. Continue Learning Hero Section */}
      {continueTarget?.course && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-900/40 p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant="primary" className="uppercase font-bold text-[10px]">
                  ⚡ Jump Back In
                </Badge>
                <span className="text-xs text-indigo-300 font-extrabold">
                  {continueTarget.course.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                {continueTarget.course.title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl line-clamp-2">
                {continueTarget.nextLesson
                  ? `Next up: "${continueTarget.nextLesson.title}"`
                  : continueTarget.course.shortDescription}
              </p>
              <div className="max-w-md pt-1">
                <ProgressBar value={continueTarget.completionPercentage} showLabel />
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const targetSlug = continueTarget.nextLesson?.slug || '';
                  navigate(`/courses/${continueTarget.course.slug}${targetSlug ? `/lessons/${targetSlug}` : ''}`);
                }}
              >
                Resume Learning ▶
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 2. My Enrolled Courses Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              📖 Active Enrolled Courses
            </h2>
            <p className="text-xs text-slate-400">Courses you are currently pursuing.</p>
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              id="search-mylearning"
              placeholder="Search enrolled title..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <CourseGrid cols="three">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="space-y-4">
                <Skeleton variant="rect" height="180px" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" />
              </Card>
            ))}
          </CourseGrid>
        ) : enrollments.length === 0 ? (
          <EmptyState
            title={search ? 'No enrolled courses match your query' : 'You have not enrolled in any courses yet'}
            description={
              search
                ? 'Try adjusting your search criteria.'
                : 'Explore our catalog and enroll in published courses to build your skills.'
            }
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => navigate('/courses')}>
                  Explore Catalog
                </Button>
              )
            }
          />
        ) : (
          <>
            <CourseGrid cols="three">
              {enrollments.map((item) => {
                const course = item.courseId;
                if (!course) return null;

                const cProgress = progressMap[course._id];
                const completionPercent = cProgress?.completionPercentage || 0;
                const completedCount = cProgress?.completedLessons || 0;
                const totalCount = cProgress?.totalLessons || 0;

                return (
                  <Card
                    key={item._id}
                    className="flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-700/60"
                  >
                    <div className="h-44 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80 mb-4 shrink-0 relative">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-600 font-extrabold text-lg select-none">
                          🎓 {course.category}
                        </div>
                      )}
                      {completionPercent === 100 && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-lg">
                          Completed ✓
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
                            {course.category}
                          </span>
                          <Badge variant="primary">{course.level}</Badge>
                        </div>
                        <h3 className="font-extrabold text-slate-100 line-clamp-1">{course.title}</h3>
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {course.shortDescription}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <ProgressBar value={completionPercent} showLabel />
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>{completedCount} / {totalCount} completed</span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => navigate(`/courses/${course.slug}`)}
                      >
                        Continue Learning →
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </CourseGrid>

            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </section>

      {/* 3. Recommended Courses Section */}
      {recommended.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              ✨ Recommended For You
            </h2>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              See All →
            </button>
          </div>

          <CourseGrid cols="three">
            {recommended.slice(0, 3).map((course) => (
              <Card
                key={course._id}
                className="flex flex-col h-full hover:border-slate-700/60 cursor-pointer group"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                <div className="h-36 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 mb-3 shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600 font-extrabold text-base select-none">
                      📚 {course.category}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-indigo-400 block">{course.category}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-white/5">
                    <span>{course.level}</span>
                    <span className="text-indigo-400">View →</span>
                  </div>
                </div>
              </Card>
            ))}
          </CourseGrid>
        </section>
      )}

      {/* 4. Popular Courses Section */}
      {popular.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              🔥 Trending & Popular Courses
            </h2>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Explore Catalog →
            </button>
          </div>

          <CourseGrid cols="three">
            {popular.slice(0, 3).map((course) => (
              <Card
                key={course._id}
                className="flex flex-col h-full hover:border-slate-700/60 cursor-pointer group"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                <div className="h-36 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 mb-3 shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600 font-extrabold text-base select-none">
                      🔥 {course.category}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-indigo-400 block">{course.category}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-white/5">
                    <span>{course.enrollmentCount || 0} enrolled</span>
                    <span className="text-indigo-400">View →</span>
                  </div>
                </div>
              </Card>
            ))}
          </CourseGrid>
        </section>
      )}
    </div>
  );
}
