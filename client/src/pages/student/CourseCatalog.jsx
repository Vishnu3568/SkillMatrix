import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as courseService from '../../services/courseService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import Pagination from '../../components/common/Pagination';
import CourseGrid from '../../components/common/CourseGrid';
import useToast from '../../hooks/useToast';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Backend Development',
    'Frontend Development',
    'Data Science',
    'Design',
    'Business',
  ];

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await courseService.getCourses({
          search,
          category,
          level,
          sort,
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

    loadCourses();
  }, [search, category, level, sort, page, toast]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Catalog"
        subtitle="Explore our library of premium interactive courses."
      />

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        level={level}
        onLevelChange={(val) => {
          setLevel(val);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      {/* Courses Grid */}
      {loading ? (
        <CourseGrid cols="three">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="space-y-4">
              <Skeleton variant="rect" height="180px" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </Card>
          ))}
        </CourseGrid>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses match your criteria"
          description="Try adjusting search terms or clearing difficulty filters."
          action={
            (search || category || level || sort !== 'newest') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            )
          }
        />
      ) : (
        <>
          <CourseGrid cols="three">
            {courses.map((course) => (
              <Card
                key={course._id}
                className="flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-700/60 cursor-pointer group"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                {/* Thumbnail */}
                <div className="h-44 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80 mb-4 shrink-0 relative">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <Badge variant="primary">{course.level}</Badge>
                    </div>
                    <h3 className="font-extrabold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>⏳ {course.estimatedDuration} mins</span>
                    <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      View Course →
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </CourseGrid>

          {/* Accessible Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}
