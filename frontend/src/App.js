import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage/Homepage';
import UserDashboard from './components/UserDashboard/UserDashboard';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Aritmetica from './components/Aritmetica/Aritmetica';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Manejar login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('innova_user', JSON.stringify(userData));
  };

  // Manejar logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('innova_user');
  };

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('innova_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('innova_user');
      }
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Homepage />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/aritmetica" element={<Aritmetica />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/admin-dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Ruta protegida - solo para admins autenticados */}
          <Route 
            path="/admin-dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;