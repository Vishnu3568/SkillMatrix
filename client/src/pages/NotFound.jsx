import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 gap-6">
      <div className="text-6xl animate-bounce">❓</div>
      <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 leading-none">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
        Page Not Found
      </h2>
      <p className="text-slate-400 max-w-sm text-sm sm:text-base leading-relaxed">
        The page you are looking for does not exist, has been moved, or you might not have authorization parameters.
      </p>
      <Link to={ROUTES.HOME} className="mt-4">
        <Button variant="primary">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
