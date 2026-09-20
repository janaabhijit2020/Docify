import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import RecentActivityPage from './pages/RecentActivityPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('docify_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('docify_token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-mark">D</div>

        <span className="dashboard-eyebrow">
          DOCIFY
        </span>

        <h1>Page not found</h1>

        <p>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <a href="/">
          Back to home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <ConversationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recent-activity"
          element={
            <ProtectedRoute>
              <RecentActivityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;