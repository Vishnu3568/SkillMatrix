import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

// Path segment display-name mapper
const routeNames = {
  admin: 'Admin',
  student: 'Student',
  dashboard: 'Dashboard',
  courses: 'Courses Catalog',
  lessons: 'Lessons',
  profile: 'My Profile',
  settings: 'Settings',
  'my-learning': 'My Learning',
};

/**
 * Reusable breadcrumbs component.
 * Parses the current URL subpaths and links them dynamically.
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 select-none">
      <Link 
        to={ROUTES.HOME}
        className="hover:text-indigo-400 transition-colors"
      >
        Home
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <div key={to} className="flex items-center space-x-2">
            <span className="text-slate-600">/</span>
            {isLast ? (
              <span className="text-slate-200 dark:text-slate-100" aria-current="page">
                {name}
              </span>
            ) : (
              <Link 
                to={to}
                className="hover:text-indigo-400 transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
