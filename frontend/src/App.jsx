import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import Login              from './pages/Login';
import Dashboard          from './pages/Dashboard';
import PatientList        from './pages/PatientList';
import PatientRegistration from './pages/PatientRegistration';
import PatientProfile     from './pages/PatientProfile';
import ClinicalVisit      from './pages/ClinicalVisit';
import CKDPrediction      from './pages/CKDPrediction';
import Reports            from './pages/Reports';
import Billing            from './pages/Billing';
import Admin              from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/patients"          element={<PatientList />} />
            <Route path="/patients/register" element={<PatientRegistration />} />
            <Route path="/patients/:id"      element={<PatientProfile />} />
            <Route path="/visits/new"        element={<ClinicalVisit />} />
            <Route path="/prediction"        element={<CKDPrediction />} />
            <Route path="/reports"           element={<Reports />} />
            <Route path="/billing"           element={<Billing />} />
            <Route path="/admin"             element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
