import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import router from './router';
import useAuthStore from './store/authStore';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // On mount: try to restore session via refresh token cookie
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#E2E8F0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#00FF88', secondary: '#111827' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#111827' },
          },
        }}
      />
    </>
  );
}
