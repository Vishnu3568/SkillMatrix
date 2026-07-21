import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as courseService from '../../services/courseService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import useToast from '../../hooks/useToast';
import { COURSE_LEVELS } from '../../constants/course';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Available Category Options
  const categories = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Design', label: 'Design' },
    { value: 'Business', label: 'Business' },
  ];

  const levels = Object.entries(COURSE_LEVELS).map(([key, val]) => ({
    value: val,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await courseService.getCourses({
          search,
          category,
          level,
          page,
          limit: 6,
        });
        if (response.success) {
          setCourses(response.data.courses);
          setTotalPages(response.data.totalPages);
        }
      } catch (err) {
        toast.error('Failed to load courses catalog');
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      loadCourses();
    }, 300); // Debounce search changes

    return () => clearTimeout(handler);
  }, [search, category, level, page, toast]);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Course Catalog" 
        subtitle="Explore our library of premium interactive courses."
      />

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        <Input
          id="search-catalog"
          placeholder="Search title, tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          label="Search"
        />
        <Select
          id="category-filter"
          options={categories}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          placeholder="All Categories"
          label="Category"
        />
        <Select
          id="level-filter"
          options={levels}
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
          placeholder="All Levels"
          label="Difficulty Level"
        />
      </div>

      {/* Courses Grid */}
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
      ) : courses.length === 0 ? (
        <EmptyState 
          title="No courses match your criteria" 
          description="Try clearing your search query or adjusting level filters."
          action={
            (search || category || level) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setLevel('');
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card 
                key={course._id} 
                className="flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-700/60"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                {/* Thumbnail */}
                <div className="h-44 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80 mb-4 shrink-0">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600 font-extrabold text-lg select-none">
                      📚 {course.category}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
                        {course.category}
                      </span>
                      <Badge variant="primary">
                        {course.level}
                      </Badge>
                    </div>
                    <h3 className="font-extrabold text-slate-100 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>⏳ {course.estimatedDuration} mins</span>
                    <span className="text-indigo-400 hover:text-indigo-300">View Course →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Buttons */}
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
