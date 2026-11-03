import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandRecordUpload from './pages/LandRecordUpload';
import LandRecords from './pages/LandRecords';
import RecordDetails from './pages/RecordDetails';
import AdminPanel from './pages/AdminPanel';
import SystemMonitoring from './pages/SystemMonitoring';
import { auth } from './services/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(auth.isAuthenticated());
    };
    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setActivePage('dashboard')} />;
  }

  const handleNavigate = (page) => {
    setActivePage(page);
    setSelectedRecordId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecordId(recordId);
    setActivePage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          {activePage === 'dashboard' && (
            <Dashboard 
              onNavigate={handleNavigate} 
              onSelectRecord={handleSelectRecord} 
            />
          )}

          {activePage === 'upload' && (
            <LandRecordUpload 
              onNavigate={handleNavigate}
              onRecordCreated={(rec) => handleSelectRecord(rec.id)}
            />
          )}

          {activePage === 'records' && (
            <LandRecords 
              onNavigate={handleNavigate} 
              onSelectRecord={handleSelectRecord} 
            />
          )}

          {activePage === 'details' && selectedRecordId && (
            <RecordDetails 
              recordId={selectedRecordId}
              onBack={() => handleNavigate('records')}
            />
          )}

          {activePage === 'admin' && (
            <AdminPanel 
              onNavigate={handleNavigate}
              onSelectRecord={handleSelectRecord}
            />
          )}

          {activePage === 'monitoring' && (
            <SystemMonitoring />
          )}
        </main>

      </div>

    </div>
  );
}
