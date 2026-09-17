import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-canvas px-4 text-center">
      <p className="text-3xl font-semibold text-ink">403</p>
      <p className="text-sm text-ink-faint">Your role doesn't have access to this page.</p>
      <Link to="/" className="mt-3 text-sm font-medium text-primary-500 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
