import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as lessonService from '../../services/lessonService';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import useToast from '../../hooks/useToast';
import { RESOURCE_TYPES } from '../../constants/lesson';

export default function LessonForm() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isPreview, setIsPreview] = useState(false);
  
  // Resource builder state
  const [resources, setResources] = useState([]);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('pdf');
  const [resUrl, setResUrl] = useState('');
  const [resSize, setResSize] = useState('1 MB');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const resourceTypeOptions = Object.entries(RESOURCE_TYPES).map(([key, val]) => ({
    value: val,
    label: key,
  }));

  useEffect(() => {
    if (!isEditMode) return;

    const loadLessonData = async () => {
      setFetching(true);
      try {
        // Fetch lesson by ID or slug? Wait, getLesson(slug) queries by slug or ID?
        // Wait, on the backend: `getLessonBySlug` checks `mongoose.Types.ObjectId.isValid(slugOrId)` and queries by `_id`!
        // That means `getLesson(id)` works out of the box because we added thatObjectId support in course services, and we should check if we did the same in `lesson.service.js`.
        // Let's check `lesson.service.js` around line 110 to see if it checks for ObjectId!
        const response = await lessonService.getLesson(id);
        if (response.success && response.data.lesson) {
          const l = response.data.lesson;
          setTitle(l.title);
          setDescription(l.description);
          setVideoUrl(l.videoUrl);
          setThumbnailUrl(l.thumbnailUrl || '');
          setDurationMinutes(Math.round(l.duration / 60));
          setIsPreview(l.isPreview || false);
          setResources(l.resources || []);
        }
      } catch (err) {
        toast.error('Failed to load lesson data for editing');
        navigate(`/admin/courses/${courseId}/lessons`);
      } finally {
        setFetching(false);
      }
    };
    loadLessonData();
  }, [courseId, id, isEditMode, navigate, toast]);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!videoUrl.trim() || !/^(http|https):\/\/[^\s]+/.test(videoUrl)) {
      errors.videoUrl = 'Valid video URL is required';
    }
    if (thumbnailUrl && !/^(http|https):\/\/[^\s]+/.test(thumbnailUrl)) {
      errors.thumbnailUrl = 'Invalid thumbnail URL format';
    }
    if (!durationMinutes || durationMinutes < 1) {
      errors.durationMinutes = 'Duration must be at least 1 minute';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      toast.warning('Resource title is required');
      return;
    }
    if (!resUrl.trim() || !/^(http|https):\/\/[^\s]+/.test(resUrl)) {
      toast.warning('Valid Resource URL is required');
      return;
    }

    const newResource = {
      title: resTitle.trim(),
      type: resType,
      url: resUrl.trim(),
      size: resSize.trim() || '0 KB',
    };

    setResources([...resources, newResource]);
    
    // Clear resource form fields
    setResTitle('');
    setResUrl('');
    setResSize('1 MB');
    toast.success('Resource metadata added');
  };

  const handleRemoveResource = (indexToRemove) => {
    setResources(resources.filter((_, idx) => idx !== indexToRemove));
    toast.info('Resource metadata removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: durationMinutes * 60, // Convert minutes to seconds
      isPreview,
      resources,
    };

    try {
      if (isEditMode) {
        await lessonService.updateLesson(id, payload);
        toast.success('Lesson updated successfully');
      } else {
        await lessonService.createLesson(courseId, payload);
        toast.success('Lesson created successfully as DRAFT');
      }
      navigate(`/admin/courses/${courseId}/lessons`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save lesson details';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader fullscreen message="Scaffolding editor workspace..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Lesson' : 'Create Lesson'}
        subtitle={isEditMode ? 'Update lesson descriptions and resource assets.' : 'Add a new lesson node to this course curriculum.'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Lesson form column */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="title"
                label="Lesson Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={validationErrors.title}
                placeholder="e.g. 01. Advanced Scopes and Closures"
                disabled={loading}
              />

              <Textarea
                id="description"
                label="Lesson Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={validationErrors.description}
                placeholder="Details about what topics are discussed in this video lesson."
                disabled={loading}
                rows={5}
              />

              <Input
                id="videoUrl"
                label="Video URL (YouTube/Vimeo/Direct MP4)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                error={validationErrors.videoUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="durationMinutes"
                  label="Duration (minutes)"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  error={validationErrors.durationMinutes}
                  disabled={loading}
                />

                <Input
                  id="thumbnailUrl"
                  label="Thumbnail Image URL (Optional)"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  error={validationErrors.thumbnailUrl}
                  placeholder="https://example.com/thumb.jpg"
                  disabled={loading}
                />
              </div>

              <Checkbox
                id="isPreview"
                label="Allow Guest Preview (No enrollment required)"
                checked={isPreview}
                onChange={(e) => setIsPreview(e.target.checked)}
                disabled={loading}
              />

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <Link to={`/admin/courses/${courseId}/lessons`}>
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="primary" loading={loading}>
                  {isEditMode ? 'Save Changes' : 'Scaffold Draft'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Resources metadata builder sidebar */}
        <div className="space-y-6">
          {/* Add resource form card */}
          <Card className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Add Lesson Resource
            </h3>
            
            <div className="space-y-3.5 text-slate-300">
              <Input
                id="resTitle"
                label="Resource Title"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="e.g. Cheatsheet notes PDF"
              />
              <Select
                id="resType"
                label="Resource Type"
                options={resourceTypeOptions}
                value={resType}
                onChange={(e) => setResType(e.target.value)}
              />
              <Input
                id="resUrl"
                label="Resource Link URL"
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                placeholder="https://..."
              />
              <Input
                id="resSize"
                label="File Size"
                value={resSize}
                onChange={(e) => setResSize(e.target.value)}
                placeholder="e.g. 1.2 MB or 45 KB"
              />
              <Button 
                variant="outline" 
                onClick={handleAddResource} 
                className="w-full justify-center text-xs mt-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              >
                ＋ Add Resource
              </Button>
            </div>
          </Card>

          {/* Resources list card */}
          <Card className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Resources List ({resources.length})
            </h3>

            {resources.length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold italic text-center py-4">
                No resources uploaded.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {resources.map((res, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-slate-200 truncate">{res.title}</h4>
                      <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="uppercase text-indigo-400">{res.type}</span>
                        <span>•</span>
                        <span>{res.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(index)}
                      className="text-rose-500 hover:text-rose-400 p-1 font-bold"
                      aria-label={`Remove resource ${res.title}`}
                    >
                      ✕
                    </button>
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
