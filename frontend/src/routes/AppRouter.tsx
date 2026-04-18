import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import LayoutBase from '../components/LayoutBase';
import { getAccessToken } from '../services/authService';

function RequireAuth() {
  const token = getAccessToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <LayoutBase />;
}

function LoginRoute() {
  const token = getAccessToken();

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return <LoginPage />;
}

function AppRouter() {
  //const token = getAccessToken();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/app" element={<RequireAuth />} />
    </Routes>
  );
}

export default AppRouter;