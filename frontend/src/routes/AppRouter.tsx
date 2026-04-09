import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import LayoutBase from '../components/LayoutBase';
import { getAccessToken } from '../services/authService';
import DashboardPage from "../pages/DashboardPage"

function AppRouter() {
  const token = getAccessToken();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={token ? <LayoutBase /> : <Navigate to="/login" replace />}
      />
      <Route path="dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRouter;