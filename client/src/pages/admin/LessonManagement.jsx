import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as lessonService from '../../services/lessonService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useToast from '../../hooks/useToast';

export default function LessonManagement() {
  const { courseId } = useParams();
  const toast = useToast();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await lessonService.getLessons(courseId, { search });
      if (response.success) {
        setLessons(response.data.lessons);
      }
    } catch (err) {
      toast.error('Failed to load course curriculum');
    } finally {
      setLoading(false);
    }
  }, [courseId, search, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLessons();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadLessons]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const response = await lessonService.deleteLesson(deleteTargetId);
      if (response.success) {
        toast.success('Lesson soft-deleted successfully');
        setDeleteTargetId(null);
        loadLessons();
      }
    } catch (err) {
      toast.error('Failed to delete lesson');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const response = await lessonService.publishLesson(id);
      if (response.success) {
        toast.success('Lesson published successfully');
        loadLessons();
      }
    } catch (err) {
      toast.error('Failed to publish lesson');
    }
  };

  const handleArchive = async (id) => {
    try {
      const response = await lessonService.archiveLesson(id);
      if (response.success) {
        toast.success('Lesson archived successfully');
        loadLessons();
      }
    } catch (err) {
      toast.error('Failed to archive lesson');
    }
  };

  // Reordering move action
  const handleMove = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;

    const reordered = [...lessons];
    // Swap elements
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const orderedIds = reordered.map((l) => l._id);
    
    try {
      setLessons(reordered); // Optimistic UI update
      const response = await lessonService.reorderLessons(courseId, orderedIds);
      if (response.success) {
        toast.success('Curriculum order updated');
        setLessons(response.data.lessons);
      }
    } catch (err) {
      toast.error('Failed to update curriculum order');
      loadLessons(); // Rollback
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lessons Syllabus Administration"
        subtitle="Manage, publish, and reorder active lessons within the course curriculum."
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/courses">
              <Button variant="outline">← Courses</Button>
            </Link>
            <Link to={`/admin/courses/${courseId}/lessons/new`}>
              <Button variant="primary">✚ Create Lesson</Button>
            </Link>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 max-w-md">
        <Input
          id="search-lessons"
          placeholder="Search lesson title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="Search Syllabus"
        />
      </div>

      {/* Syllabus Rows */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="flex gap-4">
              <Skeleton variant="text" width="5%" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" />
              </div>
            </Card>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState
          title="No lessons in curriculum"
          description="Click 'Create Lesson' to add your first video lesson tutorial."
          action={
            search && (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson, index) => (
            <Card 
              key={lesson._id} 
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-slate-800 bg-slate-900/10"
            >
              <div className="flex items-start gap-4">
                {/* Index position */}
                <div className="h-10 w-10 shrink-0 bg-slate-900 flex items-center justify-center font-black text-slate-400 rounded-lg border border-slate-800">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-100">{lesson.title}</h3>
                    <Badge variant={lesson.status === 'published' ? 'success' : lesson.status === 'draft' ? 'info' : 'warning'} className="uppercase text-[10px]">
                      {lesson.status}
                    </Badge>
                    {lesson.isPreview && (
                      <Badge variant="primary" className="text-[10px]">Preview</Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 max-w-lg line-clamp-1">
                    {lesson.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-semibold">
                    <span>⏱ {Math.round(lesson.duration / 60)} mins</span>
                    <span>📂 {lesson.resources?.length || 0} resources</span>
                  </div>
                </div>
              </div>

              {/* Action operations */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                {/* Order Up/Down Swappers */}
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-2"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    aria-label="Move lesson up"
                  >
                    ▲
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-2"
                    disabled={index === lessons.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    aria-label="Move lesson down"
                  >
                    ▼
                  </Button>
                </div>

                <Link to={`/admin/courses/${courseId}/lessons/edit/${lesson._id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>

                {lesson.status !== 'published' && (
                  <Button variant="secondary" size="sm" onClick={() => handlePublish(lesson._id)}>
                    Publish
                  </Button>
                )}

                {lesson.status === 'published' && (
                  <Button variant="outline" size="sm" onClick={() => handleArchive(lesson._id)}>
                    Archive
                  </Button>
                )}

                <Button variant="danger" size="sm" onClick={() => setDeleteTargetId(lesson._id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Soft Delete */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? The curriculum positions of other lessons will shift down automatically."
      />
    </div>
  );
}
