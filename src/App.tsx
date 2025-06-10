import React, { useEffect, Suspense } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useRoutes,
  BrowserRouter,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
// Using SimpleLoginPage for more reliable auth
import SimpleLoginPage from "./pages/auth/SimpleLoginPage";
// Original login page kept for reference
// import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardSettingsPage from "./pages/dashboard/DashboardSettingsPage";
import PodcastPage from "./pages/PodcastPage.tsx";
import PodcastDetailPage from "./pages/public/PodcastDetailPage";
import PlaylistDetailPage from "./pages/public/PlaylistDetailPage";
import PodcastCategoryPage from "./pages/public/PodcastCategoryPage";
import PlansPage from "./pages/PlansPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
import DashboardAuthGuard from "./components/dashboard/DashboardAuthGuard";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminArticlesPage from "./pages/admin/AdminArticlesPage";
import AdminArticleCreatePage from "./pages/admin/AdminArticleCreatePage";
import AdminArticleEditPage from "./pages/admin/AdminArticleEditPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminCategoryEditPage from "./pages/admin/AdminCategoryEditPage";
import AdminPodcastsPage from "./pages/admin/AdminPodcastsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminTestPage from "./pages/admin/AdminTestPage";
import AdminCommentsPage from "./pages/admin/AdminCommentsPage";
import ArticleDetailPage from "./pages/public/ArticleDetailPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./store/authStore";
import { PodcastPlaylistProvider } from "./contexts/PodcastPlaylistContext";

// Component that renders tempo routes - only used when VITE_TEMPO is true
const TempoRoutes: React.FC = () => {
  const routes = React.useMemo(() => {
    try {
      // Dynamically import tempo-routes only when needed
      // Using import() instead of require() for better error handling
      return import("tempo-routes")
        .then((module) => module.default)
        .catch((error) => {
          console.warn("Tempo routes not available:", error);
          return [];
        });
    } catch (error) {
      console.warn("Tempo routes not available:", error);
      return [];
    }
  }, []);

  // Use React.Suspense to handle the async loading of routes
  return (
    <React.Suspense fallback={<div>Loading routes...</div>}>
      {useRoutes(routes instanceof Promise ? [] : routes)}
    </React.Suspense>
  );
};

// Component that handles navigation logic - only used when Router context is available
const NavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const justConfirmedEmailAndSignedIn = useAuthStore(
    (state) => state.justConfirmedEmailAndSignedIn,
  );
  const setJustConfirmedEmailAndSignedIn = useAuthStore(
    (state) => state.setJustConfirmedEmailAndSignedIn,
  );

  // Only redirect after explicit email confirmation, not for normal logins
  useEffect(() => {
    // We only want to redirect if the flag is explicitly set after email confirmation
    // This prevents random redirects during normal navigation
    if (justConfirmedEmailAndSignedIn) {
      const user = useAuthStore.getState().user;
      if (user?.isAdmin) {
        console.log(
          "Redirecting to admin dashboard after email confirmation...",
        );
        navigate("/admin/dashboard");
      } else {
        console.log("Redirecting to dashboard after email confirmation...");
        navigate("/dashboard");
      }
      // Reset the flag immediately to prevent further redirects
      setJustConfirmedEmailAndSignedIn(false);
    }
  }, [
    justConfirmedEmailAndSignedIn,
    navigate,
    setJustConfirmedEmailAndSignedIn,
  ]);

  return null;
};

// Lazy loading for better performance
const MagazinePage = React.lazy(() => import("./pages/public/MagazinePage"));
const AstrologyPage = React.lazy(
  () => import("./pages/astrology/AstrologyPage"),
);

// Astrology Pages
const BirthChartPage = React.lazy(
  () => import("./pages/astrology/BirthChartPage"),
);
const CompatibilityPage = React.lazy(
  () => import("./pages/astrology/CompatibilityPage"),
);
const HoroscopesPage = React.lazy(
  () => import("./pages/astrology/HoroscopesPage"),
);
const TransitsPage = React.lazy(() => import("./pages/astrology/TransitsPage"));
const ReportsPage = React.lazy(() => import("./pages/astrology/ReportsPage"));
const EnhancedReportsPage = React.lazy(
  () => import("./pages/astrology/EnhancedReportsPage"),
);

const App: React.FC = () => {
  // Render tempo routes or regular routes, but never both
  if (import.meta.env.VITE_TEMPO === "true") {
    return (
      <BrowserRouter>
        <PodcastPlaylistProvider>
          <TempoRoutes />
        </PodcastPlaylistProvider>
      </BrowserRouter>
    );
  }

  return (
      <PodcastPlaylistProvider>
        <NavigationHandler />
        <Routes>
          {/* Public Routes with Error Boundaries */}
          <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
          <Route path="/login" element={
            <ErrorBoundary>
              <SimpleLoginPage />
            </ErrorBoundary>
          } />
          <Route path="/signup" element={
            <ErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-mystic-primary-900 to-black">
                <div className="w-12 h-12 border-4 border-mystic-accent-500 border-t-transparent rounded-full animate-spin"></div>
              </div>}>
                <SignupPage />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/podcasts" element={<PodcastPage />} />
          <Route
            path="/podcasts/category/:slug"
            element={<PodcastCategoryPage />}
          />
          <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
          <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route
            path="/magazine"
            element={<Navigate to="/magazine/page/1" replace />}
          />
          <Route
            path="/magazine/page/:page"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <MagazinePage />
              </Suspense>
            }
          />
          <Route
            path="/magazine/categories/:category"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <MagazinePage />
              </Suspense>
            }
          />
          <Route path="/magazine/:slug" element={<ArticleDetailPage />} />
          {/* Redirect old /articles paths to /magazine */}
          <Route
            path="/articles/:slug"
            element={<Navigate to="/magazine/:slug" replace />}
          />

          {/* Astrology Routes */}
          <Route
            path="/astrology"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <AstrologyPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/birth-chart"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <BirthChartPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/compatibility"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <CompatibilityPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/horoscopes"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <HoroscopesPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/transits"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <TransitsPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/reports"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <EnhancedReportsPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/charts"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                <ReportsPage />
              </Suspense>
            }
          />
          <Route
            path="/astrology/vedic"
            element={
              <Suspense
                fallback={<div className="p-20 text-center">Loading...</div>}
              >
                {React.createElement(
                  React.lazy(() => import("./pages/astrology/VedicPage")),
                )}
              </Suspense>
            }
          />

          {/* User Dashboard - protected with DashboardAuthGuard to prevent admin users from accessing it */}
          <Route
            path="/dashboard"
            element={
              <DashboardAuthGuard>
                <DashboardPage />
              </DashboardAuthGuard>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <DashboardAuthGuard>
                <DashboardSettingsPage />
              </DashboardAuthGuard>
            }
          />

          {/* Admin Routes - All protected by AdminAuthGuard */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <AdminAuthGuard>
                  <AdminLayout />
                </AdminAuthGuard>
              </ErrorBoundary>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="articles/new" element={<AdminArticleCreatePage />} />
            <Route
              path="articles/edit/:id"
              element={<AdminArticleEditPage />}
            />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route
              path="categories/edit/:categoryId"
              element={<AdminCategoryEditPage />}
            />
            <Route path="test" element={<AdminTestPage />} />
            <Route path="podcasts" element={<AdminPodcastsPage />} />
            <Route path="comments" element={<AdminCommentsPage />} />
            {/* <Route path="analytics" element={<AdminAnalyticsPage />} /> */}
            <Route path="settings" element={<AdminSettingsPage />} />
            {/* Index route for /admin - redirects to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </PodcastPlaylistProvider>
  );
};

export default App;
