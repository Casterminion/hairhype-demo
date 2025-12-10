import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import PrivacyPage from './pages/PrivacyPage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CalendarPage } from './pages/admin/CalendarPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { BlogsPage } from './pages/admin/BlogsPage';
import { ReviewsPage } from './pages/admin/ReviewsPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { GalleryPage } from './pages/admin/GalleryPage';
import { AdminGuard } from './components/admin/AdminGuard';
import { ToastContainer } from './admin/ui/primitives/Toast';
import './styles/tokens.css';
import './admin/styles/admin-theme.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privatumas" element={<PrivacyPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <Navigate to="/admin/dashboard" replace />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <DashboardPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <AdminGuard>
              <CalendarPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminGuard>
              <BookingsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <AdminGuard>
              <BlogsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminGuard>
              <ReviewsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/services"
          element={
            <AdminGuard>
              <ServicesPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminGuard>
              <SettingsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <AdminGuard>
              <GalleryPage />
            </AdminGuard>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>
);
