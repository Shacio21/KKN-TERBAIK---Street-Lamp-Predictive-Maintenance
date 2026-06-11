import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import router from './router';
import useAuthStore from './store/authStore';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // On mount: try to restore session via refresh token cookie
  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
          },
        }}
      />
    </>
  );
}
