import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './components/auth/AuthPage';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/ui/Loaders';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const { session, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) return <PageLoader />;
  if (!session) return <AuthPage />;
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
