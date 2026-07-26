import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as dashboardService from '../../services/dashboardService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
import useToast from '../../hooks/useToast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dashboardService.getAdminDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to fetch dashboard telemetry analytics.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Admin Analytics Dashboard"
          subtitle="Real-time telemetry and overview of platform performance metrics."
        />
        {/* Overview cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="space-y-3">
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="rect" height="32px" width="70%" />
              <Skeleton variant="text" width="80%" />
            </Card>
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="space-y-4">
            <Skeleton variant="rect" height="200px" />
          </Card>
          <Card className="space-y-4">
            <Skeleton variant="rect" height="200px" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load dashboard analytics"
          message={error}
          retryAction={loadDashboard}
        />
      </div>
    );
  }

  const { summary, topCourses, newestStudents, recentEnrollments, activityFeed } = data;

  const overviewMetrics = [
    {
      title: 'Total Users',
      value: summary.totalUsers,
      subtitle: `${summary.totalStudents} Students • ${summary.totalAdmins} Admins`,
      icon: '👥',
      color: 'border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Course Catalog',
      value: summary.totalCourses,
      subtitle: `${summary.publishedCourses} Published • ${summary.draftCourses} Drafts`,
      icon: '📚',
      color: 'border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Total Lessons',
      value: summary.totalLessons,
      subtitle: `${summary.publishedLessons} Active Published Lessons`,
      icon: '📖',
      color: 'border-sky-500/30 text-sky-400',
    },
    {
      title: 'Active Enrollments',
      value: summary.totalEnrollments,
      subtitle: `${summary.activeEnrollments} Active • ${summary.completedEnrollments} Completed`,
      icon: '🎓',
      color: 'border-amber-500/30 text-amber-400',
    },
    {
      title: 'Lesson Completions',
      value: summary.completedLessons,
      subtitle: `${summary.totalProgressRecords} Total Progress Logs`,
      icon: '✅',
      color: 'border-rose-500/30 text-rose-400',
    },
    {
      title: 'Avg Platform Completion',
      value: `${summary.averageCompletionPercentage}%`,
      subtitle: 'Across all active student progress records',
      icon: '📊',
      color: 'border-violet-500/30 text-violet-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <PageHeader
        title="Admin Analytics Dashboard"
        subtitle="Real-time telemetry and overview of platform performance metrics."
        action={
          <Button variant="primary" onClick={() => navigate('/admin/courses/new')}>
            + Create New Course
          </Button>
        }
      />

      {/* 1. Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewMetrics.map((item, index) => (
          <Card key={index} className={`border ${item.color} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {item.title}
              </span>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-slate-100">{item.value}</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold truncate">{item.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* 2. Main Analytics Grid (Top Courses & Activity Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Top Courses & Recent Enrollments) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Enrolled Courses */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                🔥 Top 5 Enrolled Courses
              </h2>
              <Link to="/admin/courses" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                View All Courses →
              </Link>
            </div>

            {topCourses.length === 0 ? (
              <EmptyState title="No courses published yet" description="Create published courses to see enrollment analytics." />
            ) : (
              <div className="space-y-3.5">
                {topCourses.map((c) => (
                  <div
                    key={c._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-16 bg-slate-900 rounded-md overflow-hidden shrink-0 border border-slate-800">
                        {c.thumbnailUrl ? (
                          <img src={c.thumbnailUrl} alt={c.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs">🎓</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-200 truncate">{c.title}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                          <span>{c.category}</span>
                          <span>•</span>
                          <Badge variant="primary" className="text-[9px] px-1 py-0">{c.level}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-indigo-400 block">
                          {c.enrollmentCount} Enrollments
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          Avg: {c.completionPercentage}% Complete
                        </span>
                      </div>
                      <div className="w-20 hidden sm:block">
                        <ProgressBar value={c.completionPercentage} size="sm" showLabel={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Latest Enrollments Table */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                🎓 Recent Student Enrollments
              </h2>
            </div>

            {recentEnrollments.length === 0 ? (
              <EmptyState title="No enrollments recorded yet" description="Student course enrollments will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Student</th>
                      <th className="py-2 px-3">Enrolled Course</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {recentEnrollments.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={item.studentId?.fullName} size="sm" />
                            <div>
                              <span className="font-bold text-slate-200 block">{item.studentId?.fullName}</span>
                              <span className="text-[10px] text-slate-500 block">{item.studentId?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-300">
                          {item.courseId?.title || 'Unknown Course'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Newest Students & Real-Time Activity Feed) */}
        <div className="space-y-8">
          {/* Newest Students */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              👤 Newest Registered Students
            </h2>

            {newestStudents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No student accounts registered.</p>
            ) : (
              <div className="space-y-3">
                {newestStudents.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.fullName} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{s.fullName}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-indigo-400 block">
                        {s.enrollmentCount} Enrolled
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Joined {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Real-time System Activity Feed */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              ⚡ Real-Time System Activity
            </h2>

            {activityFeed.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No system activity logged yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {activityFeed.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className="text-base select-none mt-0.5">{act.icon}</span>
                    <div className="min-w-0 flex-1 border-b border-white/5 pb-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{act.title}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
