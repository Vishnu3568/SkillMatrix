/**
 * CourseGrid Component
 * Responsive layout container for course cards with configurable grid columns.
 */
export default function CourseGrid({
  children,
  cols = 'three',
  className = '',
}) {
  const gridClasses = {
    two: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    three: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    four: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  };

  const selectedClass = gridClasses[cols] || gridClasses.three;

  return (
    <div className={`${selectedClass} ${className}`} role="region" aria-label="Course Grid">
      {children}
    </div>
  );
}
