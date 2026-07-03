import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Assets from '../pages/Assets';
import Tickets from '../pages/Tickets';
import Users from '../pages/Users';
import Reports from '../pages/Reports';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/assets" element={
          <PrivateRoute>
            <Assets />
          </PrivateRoute>
        } />
        <Route path="/tickets" element={
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;