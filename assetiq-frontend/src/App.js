import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Employees      from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
import Assets         from './pages/Assets'
import AssetDetail    from './pages/AssetDetail'
import AssetScan      from './pages/AssetScan'
import Assignments    from './pages/Assignments'
import DamageReports  from './pages/DamageReports'
import AIAssistant    from './pages/AIAssistant'
import Suppliers      from './pages/Suppliers'
import AuditLogs      from './pages/AuditLogs'
import Analytics      from './pages/Analytics'
import ReturnChecklist from './pages/ReturnChecklist'
import AssetRequests from './pages/AssetRequests'
import Reports from './pages/Reports'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/scan/:code" element={<AssetScan />} />
          <Route path="/"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employees"  element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/assets"     element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/damage"     element={<ProtectedRoute><DamageReports /></ProtectedRoute>} />
          <Route path="/suppliers"  element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/audit"      element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="/ai"         element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/analytics"  element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/return-checklist" element={<ProtectedRoute><ReturnChecklist /></ProtectedRoute>} />
          <Route path="*"   element={<Navigate to="/" />} />
          <Route path="/asset-requests" element={<ProtectedRoute><AssetRequests /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App