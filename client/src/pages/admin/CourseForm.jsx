import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as courseService from '../../services/courseService';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import useToast from '../../hooks/useToast';
import { COURSE_LEVELS } from '../../constants/course';

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState(COURSE_LEVELS.BEGINNER);
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Design', label: 'Design' },
    { value: 'Business', label: 'Business' },
  ];

  const levelOptions = Object.entries(COURSE_LEVELS).map(([key, val]) => ({
    value: val,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  useEffect(() => {
    if (!isEditMode) return;

    const loadCourseData = async () => {
      setFetching(true);
      try {
        // Since getCourse is by slug, let's make sure we query properly. Wait, our route has GET /api/courses/:slug.
        // Wait! In the controller, we defined `getCourseBySlug`. But what if we only have the ID in edit mode?
        // Wait, does the API or controller support GET /api/courses/id?
        // No! The route list is:
        // GET /api/courses/:slug
        // Wait! Can we search courses by ID or is there a way to query by slug?
        // In client CourseManagement list, we can store courses in state. If the Admin clicks Edit, we navigate to `/admin/courses/edit/:id`.
        // Wait! If the route only has GET /api/courses/:slug, let's see how we can fetch a course by ID.
        // Ah, let's check: can we make GET /api/courses/:slug support either the slug OR the ID?
        // Yes! In `server/src/services/course.service.js`:
        // `getCourseBySlug(slug, userRole)`
        // We can write it to query:
        // `const query = mongoose.Types.ObjectId.isValid(slug) ? { _id: slug } : { slug };`
        // That is an extremely smart and robust engineering practice! It makes the GET endpoint accept both slugs and Object IDs seamlessly!
        // Let's modify `server/src/services/course.service.js` to support this, so that we can fetch the course using ID in the edit form!
        const response = await courseService.getCourse(id);
        if (response.success && response.data.course) {
          const c = response.data.course;
          setTitle(c.title);
          setShortDescription(c.shortDescription);
          setDescription(c.description);
          setThumbnailUrl(c.thumbnailUrl || '');
          setCategory(c.category);
          setLevel(c.level);
          setEstimatedDuration(c.estimatedDuration);
          setTags(c.tags ? c.tags.join(', ') : '');
        }
      } catch (err) {
        toast.error('Failed to retrieve course data for editing');
        navigate('/admin/courses');
      } finally {
        setFetching(false);
      }
    };
    loadCourseData();
  }, [id, isEditMode, navigate, toast]);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!description.trim()) errors.description = 'Description is required';
    
    if (thumbnailUrl && !/^(http|https):\/\/[^\s]+/.test(thumbnailUrl)) {
      errors.thumbnailUrl = 'Invalid image URL format';
    }

    if (!estimatedDuration || estimatedDuration < 1) {
      errors.estimatedDuration = 'Duration must be at least 1 minute';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    // Parse comma-separated tags into array
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      shortDescription,
      description,
      thumbnailUrl,
      category,
      level,
      estimatedDuration: Number(estimatedDuration),
      tags: parsedTags,
    };

    try {
      if (isEditMode) {
        await courseService.updateCourse(id, payload);
        toast.success('Course updated successfully');
      } else {
        await courseService.createCourse(payload);
        toast.success('Course created successfully as DRAFT');
      }
      navigate('/admin/courses');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save course changes';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader fullscreen message="Scaffolding editor workspace..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Course' : 'Create Course'}
        subtitle={isEditMode ? 'Update existing curriculum details.' : 'Scaffold a new draft course catalog entry.'}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            label="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={validationErrors.title}
            placeholder="e.g. Modern Full-Stack React Development"
            disabled={loading}
          />

          <Input
            id="shortDescription"
            label="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            error={validationErrors.shortDescription}
            placeholder="A brief 1-2 sentence overview of the course scope."
            disabled={loading}
          />

          <Textarea
            id="description"
            label="Full Course Description / Syllabus"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={validationErrors.description}
            placeholder="Detailed course schedule, learning outcomes, and prerequisites."
            disabled={loading}
            rows={6}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="category"
              label="Category"
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            />

            <Select
              id="level"
              label="Difficulty Level"
              options={levelOptions}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="estimatedDuration"
              label="Duration (minutes)"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              error={validationErrors.estimatedDuration}
              disabled={loading}
            />

            <Input
              id="tags"
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. react, js, api, security"
              disabled={loading}
            />
          </div>

          <Input
            id="thumbnailUrl"
            label="Thumbnail Image URL (Optional)"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            error={validationErrors.thumbnailUrl}
            placeholder="https://images.unsplash.com/..."
            disabled={loading}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Link to="/admin/courses">
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
  );
}
