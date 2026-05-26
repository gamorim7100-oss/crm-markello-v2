import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLayout, ProtectedRoute } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';

// Lazy loading pages for performance (can be normal imports too)
import { lazy, Suspense } from 'react';
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const KanbanPage = lazy(() => import('@/pages/KanbanPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route 
                path="/" 
                element={
                  <Suspense fallback={<div className="p-8">Carregando Dashboard...</div>}>
                    <DashboardPage />
                  </Suspense>
                } 
              />
              <Route 
                path="/kanban" 
                element={
                  <Suspense fallback={<div className="p-8">Carregando Funil...</div>}>
                    <KanbanPage />
                  </Suspense>
                } 
              />
              <Route 
                path="/agenda" 
                element={
                  <Suspense fallback={<div className="p-8">Carregando Agenda...</div>}>
                    <CalendarPage />
                  </Suspense>
                } 
              />
            </Route>
          </Route>
        </Routes>
        <Toaster theme="dark" richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
