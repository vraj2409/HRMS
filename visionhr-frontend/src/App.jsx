import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter.jsx';
import useAuthBootstrap from './hooks/useAuthBootstrap.js';

function AuthBoundary({ children }) {
  useAuthBootstrap();
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBoundary>
        <AppRouter />
      </AuthBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </BrowserRouter>
  );
}
