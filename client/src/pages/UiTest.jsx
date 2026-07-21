import { useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Skeleton from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Tooltip from '../components/common/Tooltip';
import useToast from '../hooks/useToast';

function CrashingComponent() {
  // Simulates a react rendering crash to test ErrorBoundary
  throw new Error('This is a simulated component render error!');
}

export default function UiTest() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [shouldCrash, setShouldCrash] = useState(false);

  const handleConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmOpen(false);
      toast.success('Action confirmed successfully!');
    }, 1500);
  };

  if (shouldCrash) {
    return <CrashingComponent />;
  }

  return (
    <div className="space-y-12 py-8 max-w-4xl mx-auto px-4">
      {/* Introduction */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">UI Component Playground</h1>
        <p className="text-slate-400 text-sm mt-1">
          A developer utility page to verify responsive design, theme modes, accessibility controls, and reusable UI components.
        </p>
      </div>

      {/* Toast Triggers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">1. Toast Notifications</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => toast.success('Operation succeeded!')}>
            Success Toast
          </Button>
          <Button variant="danger" onClick={() => toast.error('Something went wrong!')}>
            Error Toast
          </Button>
          <Button variant="secondary" onClick={() => toast.warning('Warning: check parameters!')}>
            Warning Toast
          </Button>
          <Button variant="outline" onClick={() => toast.info('Info: session refreshing...')}>
            Info Toast
          </Button>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">2. Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </section>

      {/* Cards & Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">3. Cards & Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-sm font-bold text-slate-200">Interactive Badges</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="primary">Admin</Badge>
              <Badge variant="success">Student</Badge>
              <Badge variant="warning">Draft</Badge>
              <Badge variant="danger">Blocked</Badge>
              <Badge variant="info">Active</Badge>
            </div>
          </Card>
          <Card onClick={() => toast.info('Card clicked!')}>
            <h3 className="text-sm font-bold text-slate-200">Clickable Card</h3>
            <p className="text-xs text-slate-400 mt-1">
              Hover over this card to see elevated shadows and transitions. Click to trigger toast.
            </p>
          </Card>
        </div>
      </section>

      {/* Dialogs & Overlays */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">4. Dialogs & Overlays</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Open Confirm Dialog
          </Button>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sample Modal Title">
          <p className="text-sm text-slate-300">
            This modal traps keyboard focus (Tab key) and locks context scope. You can press the **Escape** key or click on the backdrop to close it.
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Got it
            </Button>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          loading={confirmLoading}
          title="Delete Item"
          message="Are you sure you want to delete this resource permanently? This action cannot be reversed."
          confirmText="Yes, Delete"
        />
      </section>

      {/* Avatars & Tooltips */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">5. Avatars & Tooltips</h2>
        <div className="flex items-center gap-6">
          <Tooltip content="Admin Profile" position="top">
            <Avatar name="Admin User" size="lg" />
          </Tooltip>
          <Tooltip content="Student Profile" position="bottom">
            <Avatar name="Student User" size="md" />
          </Tooltip>
          <Tooltip content="Tooltip Left" position="left">
            <Button variant="outline" size="sm">Hover Left</Button>
          </Tooltip>
          <Tooltip content="Tooltip Right" position="right">
            <Button variant="outline" size="sm">Hover Right</Button>
          </Tooltip>
        </div>
      </section>

      {/* Feedback States & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">6. Feedback States & Loaders</h2>
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-3">Skeleton Loader</h3>
            <div className="space-y-2">
              <Skeleton variant="circle" width="40px" height="40px" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" />
              <Skeleton variant="rect" height="80px" />
            </div>
          </Card>

          <EmptyState
            title="No enrollments yet"
            description="You have not enrolled in any courses. Browse the catalog to get started."
            action={<Button variant="primary" size="sm">Browse Courses</Button>}
          />

          <ErrorState
            title="Failed to load dashboard metrics"
            message="We encountered a database timeout error. Please retry the request."
            retryAction={() => toast.info('Retrying connection...')}
          />
        </div>
      </section>

      {/* Error Boundary Trigger */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">7. Error Boundary Test</h2>
        <Card className="border-rose-500/20 bg-rose-950/5">
          <h3 className="text-sm font-bold text-slate-200">Crash Simulation</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Clicking this button will force a React render error, triggering the nearest ErrorBoundary wrapper to verify recovery layouts.
          </p>
          <Button variant="danger" onClick={() => setShouldCrash(true)}>
            Simulate Render Crash
          </Button>
        </Card>
      </section>
    </div>
  );
}
