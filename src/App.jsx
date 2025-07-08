import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import Patients from './pages/admin/Patients';
import Appointments from './pages/admin/Appointments';
import Calendar from './pages/admin/Calendar';
import PatientDashboard from './pages/patient/PatientDashboard';
import { Button } from './components/ui/button';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if(!user) return <Navigate to="/login" />;

    if(!allowedRoles.includes(user.role)) {
        if(user.role === 'Admin') return <Navigate to="/admin" />;
        else if(user.role === 'Patient') return <Navigate to="/patient" />;
    }
    
    return children
};

const ProtectedRoutes = () => {
  const { user } = useContext(AuthContext);

  const AuthRedirect = () => {
    if (user) {
      return user.role === 'Admin' ? <Navigate to="/admin" /> : <Navigate to="/patient" />;
    }
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={AuthRedirect() || <Login />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <Navigate to="/admin/dashboard" />
        </PrivateRoute>
      } />
      <Route path="/admin/dashboard" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/admin/patients" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <Patients />
        </PrivateRoute>
      } />
      <Route path="/admin/appointments" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <Appointments />
        </PrivateRoute>
      } />
      <Route path="/admin/calendar" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <Calendar />
        </PrivateRoute>
      } />
      <Route path="/patient/*" element={
        <PrivateRoute allowedRoles={['Patient']}>
          <PatientDashboard />
        </PrivateRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
};

const App = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <ThemeProvider>
            <ProtectedRoutes />            
          </ThemeProvider>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;