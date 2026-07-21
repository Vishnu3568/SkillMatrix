import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as courseService from '../../services/courseService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useToast from '../../hooks/useToast';
import { COURSE_STATUS, COURSE_LEVELS } from '../../constants/course';

export default function CourseManagement() {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Confirm state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusOptions = Object.entries(COURSE_STATUS).map(([key, val]) => ({
    value: val,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  const levelOptions = Object.entries(COURSE_LEVELS).map(([key, val]) => ({
    value: val,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await courseService.getCourses({
        search,
        status,
        level,
        page,
        limit: 8,
      });
      if (response.success) {
        setCourses(response.data.courses);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load active courses database');
    } finally {
      setLoading(false);
    }
  }, [search, status, level, page, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadCourses();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadCourses]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const response = await courseService.deleteCourse(deleteTargetId);
      if (response.success) {
        toast.success('Course soft-deleted successfully');
        setDeleteTargetId(null);
        loadCourses();
      }
    } catch (err) {
      toast.error('Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const response = await courseService.publishCourse(id);
      if (response.success) {
        toast.success('Course published successfully');
        loadCourses();
      }
    } catch (err) {
      toast.error('Failed to publish course');
    }
  };

  const handleArchive = async (id) => {
    try {
      const response = await courseService.archiveCourse(id);
      if (response.success) {
        toast.success('Course archived successfully');
        loadCourses();
      }
    } catch (err) {
      toast.error('Failed to archive course');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Administration"
        subtitle="Manage and build structural catalog curriculums."
        action={
          <Link to="/admin/courses/new">
            <Button variant="primary">✚ Create Course</Button>
          </Link>
        }
      />

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        <Input
          id="search-admin"
          placeholder="Search course title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          label="Search Database"
        />
        <Select
          id="status-filter"
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="All Statuses"
          label="Status"
        />
        <Select
          id="level-filter-admin"
          options={levelOptions}
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
          placeholder="All Levels"
          label="Difficulty Level"
        />
      </div>

      {/* Main course rows */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="flex gap-4">
              <Skeleton variant="rect" width="100px" height="80px" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" />
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses registered"
          description="Click 'Create Course' to scaffold your first interactive curriculum."
          action={
            (search || status || level) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setLevel('');
                  setPage(1);
                }}
              >
                Reset Search
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <Card 
              key={course._id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-slate-800 bg-slate-900/10 hover:border-slate-800"
            >
              <div className="flex items-start gap-4">
                {/* Visual Thumbnail replacement */}
                <div className="hidden xs:flex h-16 w-20 bg-slate-900 items-center justify-center text-xl rounded-lg border border-slate-800">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-100">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'info' : 'warning'} className="uppercase">
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 max-w-lg line-clamp-1">
                    {course.shortDescription}
                  </p>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-semibold">
                    <span>📂 {course.category}</span>
                    <span>⚡ {course.level}</span>
                    <span>⌛ {course.estimatedDuration} mins</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link to={`/admin/courses/edit/${course._id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                
                {course.status !== 'published' && (
                  <Button variant="secondary" size="sm" onClick={() => handlePublish(course._id)}>
                    Publish
                  </Button>
                )}

                {course.status === 'published' && (
                  <Button variant="outline" size="sm" onClick={() => handleArchive(course._id)}>
                    Archive
                  </Button>
                )}

                <Button variant="danger" size="sm" onClick={() => setDeleteTargetId(course._id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-400 font-bold">
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
        </div>
      )}

      {/* Soft Delete confirmation popup */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Confirm Soft Delete"
        message="Are you sure you want to delete this course? You can restore it from database hooks later."
      />
    </div>
  );
}
