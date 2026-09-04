import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import WorkflowSection from './components/WorkflowSection'
import ValidationSection from './components/ValidationSection'
import MultilingualSection from './components/MultilingualSection'
import GISSection from './components/GISSection'
import VerificationSection from './components/VerificationSection'
import SecuritySection from './components/SecuritySection'
import FooterSection from './components/FooterSection'
import AIDemoModal from './components/AIDemoModal'
import AppErrorBoundary from './components/AppErrorBoundary'

import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ValidationPage from './pages/ValidationPage'
import RecordPage from './pages/RecordPage'
import RecordsPage from './pages/RecordsPage'
import DashboardPage from './pages/DashboardPage'
import GISPage from './pages/GISPage'
import SettingsPage from './pages/SettingsPage'
import OfficersPage from './pages/OfficersPage'
import NotificationsPage from './pages/NotificationsPage'
import DashboardLayout from './layouts/DashboardLayout'

import './App.css'


// ==================================================
// Landing Page
// ==================================================

function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero onDemo={() => setDemoOpen(true)} />
        <ProblemSection />
        <WorkflowSection />
        <ValidationSection />
        <MultilingualSection />
        <GISSection />
        <VerificationSection />
        <SecuritySection />
      </main>

      <FooterSection onDemo={() => setDemoOpen(true)} onExplore={() => navigate('/dashboard')} />
      <AIDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  )
}


// ==================================================
// Main Application
// ==================================================

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
      <Routes>

        {/* Landing page */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/processing/:documentId" element={<ProcessingPage />} />
          <Route path="/validation/:documentId" element={<ValidationPage />} />
          <Route path="/record/:documentId" element={<RecordPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/records/:recordId" element={<RecordPage />} />
          <Route path="/gis" element={<GISPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/officers" element={<OfficersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

      </Routes>
      </AppErrorBoundary>
    </BrowserRouter>
  )
}

export default App