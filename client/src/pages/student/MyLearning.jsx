import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as enrollmentService from '../../services/enrollmentService';
import * as progressService from '../../services/progressService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
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

        // Fetch course progress metrics for each enrolled course in parallel
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

  useEffect(() => {
    const handler = setTimeout(() => {
      loadEnrollments();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadEnrollments]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Learning Portal"
        subtitle="Manage, track, and continue your active course enrollments."
        action={
          <Button variant="outline" onClick={() => navigate('/courses')}>
            🔍 Browse Courses
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 max-w-md">
        <Input
          id="search-mylearning"
          placeholder="Search enrolled course title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          label="Search Enrolled Courses"
        />
      </div>

      {/* Enrollments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="space-y-4">
              <Skeleton variant="rect" height="180px" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          title={search ? 'No enrolled courses match your search' : 'You are not enrolled in any courses yet'}
          description={
            search
              ? 'Try adjusting your search query or clear the filter.'
              : 'Explore our catalog and enroll in published courses to start learning.'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              const course = item.courseId;
              if (!course) return null;

              const cProgress = progressMap[course._id];
              const completionPercent = cProgress?.completionPercentage || 0;
              const completedCount = cProgress?.completedLessons || 0;
              const totalCount = cProgress?.totalLessons || 0;

              const enrolledDate = new Date(item.enrolledAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <Card
                  key={item._id}
                  className="flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-700/60"
                >
                  {/* Course Thumbnail */}
                  <div className="h-44 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80 mb-4 shrink-0 relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
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

                  {/* Course Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
                          {course.category}
                        </span>
                        <Badge variant="primary">{course.level}</Badge>
                      </div>
                      <h3 className="font-extrabold text-slate-100 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <ProgressBar value={completionPercent} showLabel />
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Enrolled: {enrolledDate}</span>
                        <span>{completedCount} / {totalCount} completed</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => navigate(`/courses/${course.slug}`)}
                      >
                        Continue Learning →
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-400 font-bold select-none">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
