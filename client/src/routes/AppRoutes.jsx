import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { GuestRoute, ProtectedRoute, RoleRoute } from './RouteGuards';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import ScrollRestoration from '../components/common/ScrollRestoration';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load layout and view components for optimized chunk split performance
const SharedLayout = lazy(() => import('../layouts/SharedLayout'));
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const StudentLayout = lazy(() => import('../layouts/StudentLayout'));
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Course modules
const CourseCatalog = lazy(() => import('../pages/student/CourseCatalog'));
const CourseDetails = lazy(() => import('../pages/CourseDetails'));
const CourseManagement = lazy(() => import('../pages/admin/CourseManagement'));
const CourseForm = lazy(() => import('../pages/admin/CourseForm'));

// Lesson modules
const LessonManagement = lazy(() => import('../pages/admin/LessonManagement'));
const LessonForm = lazy(() => import('../pages/admin/LessonForm'));
const LessonPlayer = lazy(() => import('../pages/student/LessonPlayer'));

// Student portal modules
const MyLearning = lazy(() => import('../pages/student/MyLearning'));



function PagePlaceholder({ name, phase }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 gap-4 max-w-md mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{name}</h2>
      <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
        The {name} feature is planned and scheduled for implementation during **{phase}**. The base architecture has been set up.
      </p>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/50 mt-4">
        Status: Scheduled
      </span>
    </div>
  );
}

function DashboardRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return currentUser.role === 'admin' ? (
    <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  ) : (
    <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />
  );
}

const UiTest = lazy(() => import('../pages/UiTest'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <ScrollRestoration />
      <Suspense fallback={<Loader fullscreen message="Loading requested view..." />}>
        <Routes>
          {/* Public Pages */}
          <Route path={ROUTES.HOME} element={<SharedLayout />}>
            <Route index element={<Home />} />
            <Route path={ROUTES.COURSES} element={<CourseCatalog />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<LessonPlayer />} />
            <Route path="/ui-test" element={<UiTest />} />
            
            {/* Guest-only auth routes */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Redirect /dashboard to the specific role space */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardRedirect />} />

            {/* Admin Dashboard Workspace */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminLayout />}>
                <Route index element={<PagePlaceholder name="Admin Console" phase="Phase 4 (Course/Lesson CRUD)" />} />
                <Route path="/admin/courses" element={<CourseManagement />} />
                <Route path="/admin/courses/new" element={<CourseForm />} />
                <Route path="/admin/courses/edit/:id" element={<CourseForm />} />
                <Route path="/admin/courses/:courseId/lessons" element={<LessonManagement />} />
                <Route path="/admin/courses/:courseId/lessons/new" element={<LessonForm />} />
                <Route path="/admin/courses/:courseId/lessons/edit/:id" element={<LessonForm />} />
                <Route path="/admin/lessons" element={<Navigate to="/admin/courses" replace />} />
                <Route path="/admin/students" element={<PagePlaceholder name="Students Records" phase="Phase 5 (Enrollments/Progress)" />} />
                <Route path="/admin/settings" element={<PagePlaceholder name="Administrative Settings" phase="Phase 6 (Analytics)" />} />
              </Route>
            </Route>

            {/* Student Dashboard Workspace */}
            <Route element={<RoleRoute allowedRoles={['student']} />}>
              <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentLayout />}>
                <Route index element={<Navigate to="/student/my-learning" replace />} />
                <Route path="/student/my-learning" element={<MyLearning />} />
                <Route path="/student/profile" element={<PagePlaceholder name="Student Profile" phase="Phase 6 (Portfolio)" />} />
                <Route path="/student/settings" element={<PagePlaceholder name="Student Settings" phase="Phase 6 (Portal customization)" />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
