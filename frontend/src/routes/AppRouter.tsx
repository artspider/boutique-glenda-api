import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import LayoutBase from '../components/LayoutBase';
import { getAccessToken } from '../services/authService';

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
    </Routes>
  );
}

export default AppRouter;