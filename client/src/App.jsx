// File: client/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all your page components
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CreateReportPage from './pages/CreateReportPage';
import EditReportPage from './pages/EditReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import MyReportsPage from './pages/MyReportsPage';
import FoundPersonsPage from './pages/FoundPersonsPage'; // <-- 1. IMPORT NEW PAGE

// Import your main components
import Navbar from './components/Navbar';

// Import your global styles
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      
      <main className="container">
        <Routes>
          {/* Your existing routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-report" element={<CreateReportPage />} />
          <Route path="/edit-report/:id" element={<EditReportPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />

          {/* ✅ --- 2. ADD THE NEW ROUTE --- ✅ */}
          <Route path="/found" element={<FoundPersonsPage />} />

        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;