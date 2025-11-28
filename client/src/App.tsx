import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedDashboard } from './components/ProtectedDashboard';
import Login from './pages/Login';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Dashboard from './pages/Dashboard';
import QualityRegister from './pages/QualityRegister';
import Certificates from './pages/Certificates';
import Alerts from './pages/Alerts';
import NonConformities from './pages/NonConformities';
import Products from './pages/Products';
import Users from './pages/Users';
import Layout from './components/Layout';
import PublicProducts from './pages/PublicProducts';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/public-products" element={<PublicProducts />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={
            <ProtectedDashboard>
              <Dashboard />
            </ProtectedDashboard>
          } />
          <Route path="quality">
            <Route path="register" element={<QualityRegister />} />
          </Route>
          <Route path="certificates" element={<Certificates />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="non-conformities" element={<NonConformities />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

