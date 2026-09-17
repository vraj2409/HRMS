import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../features/auth/authApi.js';
import { setCredentials } from '../features/auth/authSlice.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import loginIllustration from './login_illustration.jpg';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await authApi.login(email, password);
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: data.user,
        })
      );
      toast.success(`Welcome back, ${data.user.fullName || data.user.email}.`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      if (err.response?.status === 429) toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left side — Gradient / Branding */}
      <div className="hidden lg:flex w-1/2 gradient-hero flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="animate-fade-in relative z-10 text-center max-w-lg flex flex-col items-center">
          <img
            src={loginIllustration}
            alt="Workspace Illustration"
            className="w-full max-w-md object-cover mb-8 rounded-2xl shadow-2xl"
          />
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Modern HR <br /> for modern teams.
          </h1>
          <p className="text-lg text-white/80">
            VisionHR connects your workforce. Simplify attendance, manage time-off, and automate payroll all in one intuitive platform.
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="animate-slide-up mx-auto w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white shadow-lg lg:hidden">
              VH
            </div>
            <h2 className="text-2xl font-bold text-ink">Welcome to VisionHR</h2>
            <p className="mt-2 text-sm text-ink-faint">
              Sign in with your corporate credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Work email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-ink-faint hover:text-ink"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="animate-fade-in rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 border border-rose-100">
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full mt-2" size="lg">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
