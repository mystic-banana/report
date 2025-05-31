import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PodcastPage from './pages/PodcastPage.tsx';
import PodcastDetailPage from './pages/public/PodcastDetailPage';
import PodcastCategoryPage from './pages/public/PodcastCategoryPage';
import PlansPage from './pages/PlansPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import DashboardAuthGuard from './components/dashboard/DashboardAuthGuard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminArticleCreatePage from './pages/admin/AdminArticleCreatePage';
import AdminArticleEditPage from './pages/admin/AdminArticleEditPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCategoryEditPage from './pages/admin/AdminCategoryEditPage';
import AdminPodcastsPage from './pages/admin/AdminPodcastsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTestPage from './pages/admin/AdminTestPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import ArticleDetailPage from './pages/public/ArticleDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';

// Lazy loading MagazinePage for better performance
const MagazinePage = React.lazy(() => import('./pages/public/MagazinePage'));

const App: React.FC = () => {
  const navigate = useNavigate();
  const justConfirmedEmailAndSignedIn = useAuthStore((state) => state.justConfirmedEmailAndSignedIn);
  const setJustConfirmedEmailAndSignedIn = useAuthStore((state) => state.setJustConfirmedEmailAndSignedIn);

  // Only redirect after explicit email confirmation, not for normal logins
  useEffect(() => {
    // We only want to redirect if the flag is explicitly set after email confirmation
    // This prevents random redirects during normal navigation
    if (justConfirmedEmailAndSignedIn) {
      const user = useAuthStore.getState().user;
      if (user?.isAdmin) {
        console.log('Redirecting to admin dashboard after email confirmation...');
        navigate('/admin/dashboard');
      } else {
        console.log('Redirecting to dashboard after email confirmation...');
        navigate('/dashboard');
      }
      // Reset the flag immediately to prevent further redirects
      setJustConfirmedEmailAndSignedIn(false);
    }
  }, [justConfirmedEmailAndSignedIn, navigate, setJustConfirmedEmailAndSignedIn]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/podcasts" element={<PodcastPage />} />
      <Route path="/podcasts/category/:slug" element={<PodcastCategoryPage />} />
      <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/magazine" element={<Navigate to="/magazine/page/1" replace />} />
      <Route path="/magazine/page/:page" element={<Suspense fallback={<div className="p-20 text-center">Loading...</div>}><MagazinePage /></Suspense>} />
      <Route path="/magazine/categories/:category" element={<Suspense fallback={<div className="p-20 text-center">Loading...</div>}><MagazinePage /></Suspense>} />
      <Route path="/magazine/:slug" element={<ArticleDetailPage />} />
      {/* Redirect old /articles paths to /magazine */}
      <Route path="/articles/:slug" element={<Navigate to="/magazine/:slug" replace />} />

      {/* User Dashboard - protected with DashboardAuthGuard to prevent admin users from accessing it */}
      <Route path="/dashboard" element={<DashboardAuthGuard><DashboardPage /></DashboardAuthGuard>} />

      {/* Admin Routes - All protected by AdminAuthGuard */}
      <Route path="/admin" element={
        <ErrorBoundary>
          <AdminAuthGuard>
            <AdminLayout />
          </AdminAuthGuard>
        </ErrorBoundary>
      }>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="articles" element={<AdminArticlesPage />} />
        <Route path="articles/new" element={<AdminArticleCreatePage />} />
        <Route path="articles/edit/:id" element={<AdminArticleEditPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/edit/:categoryId" element={<AdminCategoryEditPage />} />
        <Route path="test" element={<AdminTestPage />} />
        <Route path="podcasts" element={<AdminPodcastsPage />} />
        <Route path="comments" element={<AdminCommentsPage />} />
        {/* <Route path="analytics" element={<AdminAnalyticsPage />} /> */}
        <Route path="settings" element={<AdminSettingsPage />} />
        {/* Index route for /admin - redirects to /admin/dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;