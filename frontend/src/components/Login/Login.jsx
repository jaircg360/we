import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  // Lista de administradores autorizados
  const authorizedAdmins = [
    { username: 'admin', password: 'Admin123!', name: 'Administrador Principal' },
    { username: 'supervisor', password: 'Super123!', name: 'Supervisor' },
    { username: 'tecadmin', password: 'TecAdmin456!', name: 'Administrador Técnico' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Sistema bloqueado. Intenta nuevamente en ${lockTime} segundos`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!credentials.username || !credentials.password) {
        setError('Por favor ingresa usuario y contraseña');
        return;
      }

      // Verificar si es un administrador autorizado
      const adminUser = authorizedAdmins.find(
        admin => 
          admin.username === credentials.username && 
          admin.password === credentials.password
      );

      if (adminUser) {
        // Login exitoso - resetear intentos
        setAttempts(0);
        
        const userData = {
          username: adminUser.username,
          name: adminUser.name,
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        
        if (onLogin) {
          onLogin(userData);
        }
        
        // Navegar al dashboard admin
        navigate('/admin-dashboard');
      } else {
        // Incrementar intentos fallidos
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Bloquear después de 3 intentos fallidos
          setIsLocked(true);
          let lockSeconds = 30;
          setLockTime(lockSeconds);
          
          const lockInterval = setInterval(() => {
            lockSeconds -= 1;
            setLockTime(lockSeconds);
            
            if (lockSeconds <= 0) {
              clearInterval(lockInterval);
              setIsLocked(false);
              setAttempts(0);
            }
          }, 1000);
          
          setError('Demasiados intentos fallidos. Sistema bloqueado temporalmente.');
        } else {
          setError(`Credenciales inválidas. Intentos restantes: ${3 - newAttempts}`);
        }
      }
    } catch (err) {
      setError('Error de autenticación. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const fillDemoCredentials = (adminType) => {
    if (isLocked) return;

    const demoTemplates = {
      superadmin: { username: 'admin', password: 'Admin123!' },
      supervisor: { username: 'supervisor', password: 'Super123!' },
      technical: { username: 'tecadmin', password: 'TecAdmin456!' }
    };

    const demo = demoTemplates[adminType];
    if (demo) {
      setCredentials(demo);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
    loading: { scale: 0.95 }
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="login-container dark-theme"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="login-card admin-login-card"
        variants={cardVariants}
      >
        <motion.div className="login-header" variants={itemVariants}>
          <div className="logo-section">
            <motion.img 
              src="/innova.png" 
              alt="Innova Tec" 
              className="login-logo"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="brand-text">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Innova Tec
              </motion.h1>
              <motion.span 
                className="admin-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Panel Administrativo
              </motion.span>
            </div>
          </div>
          <motion.p 
            className="login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sistema de Administración - Vision&Señas-IA
          </motion.p>
          <motion.div 
            className="access-warning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            ⚠️ Acceso restringido para personal autorizado
          </motion.div>
        </motion.div>

        <motion.form 
          className="login-form" 
          onSubmit={handleSubmit}
          variants={containerVariants}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className={`error-message ${isLocked ? 'locked' : ''}`}
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={error}
              >
                {isLocked ? '🔒' : '⚠️'} {error}
              </motion.div>
            )}
          </AnimatePresence>

          {isLocked && (
            <motion.div 
              className="lock-timer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              ⏱️ Tiempo restante: {lockTime} segundos
            </motion.div>
          )}

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="username">
              Usuario Administrador 
              <span className="required">*</span>
            </label>
            <motion.input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Usuario administrativo"
              required
              disabled={isLoading || isLocked}
              className={attempts > 0 ? 'warning' : ''}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="password">
              Contraseña 
              <span className="required">*</span>
            </label>
            <motion.input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Contraseña administrativa"
              required
              disabled={isLoading || isLocked}
              className={attempts > 0 ? 'warning' : ''}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
          </motion.div>

          <motion.div 
            className="security-info"
            variants={itemVariants}
          >
            <div className="attempts-counter">
              🔐 Intentos fallidos: {attempts}/3
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={`login-button ${isLocked ? 'locked' : ''}`}
            disabled={isLoading || isLocked}
            variants={buttonVariants}
            initial="initial"
            whileHover={!isLoading && !isLocked ? "hover" : "initial"}
            whileTap={!isLoading && !isLocked ? "tap" : "initial"}
            animate={isLoading ? "loading" : "initial"}
          >
            {isLoading ? (
              <>
                <motion.div 
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Verificando credenciales...
              </>
            ) : isLocked ? (
              '🔒 Sistema Bloqueado'
            ) : (
              '🚀 Acceder al Panel Admin'
            )}
          </motion.button>
        </motion.form>


        <motion.div 
          className="login-footer"
          variants={itemVariants}
        >
          <motion.div 
            className="security-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            🔒 Este sistema registra todos los accesos administrativos
          </motion.div>
          <p>Para acceso de administrador, contacta al director del sistema</p>
          <motion.div 
            className="version"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            v1.0.0 | Solo Administradores
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Partículas de fondo */}
      <div className="background-particles">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              opacity: 0,
              scale: 0,
              x: Math.random() * 100,
              y: Math.random() * 100
            }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
              x: Math.random() * 100,
              y: Math.random() * 100
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Login;