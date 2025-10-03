import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import ProfileCard from './ProfileCard';

// Animaciones reutilizables
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Header */}
      <motion.header 
        className="homepage-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <motion.div 
            className="logo-section"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img 
              src="/innova.png" 
              alt="Innova Tec" 
              className="logo"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="brand-text">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Innova Tec
              </motion.h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Vision&Señas-IA
              </motion.span>
            </div>
          </motion.div>
          <nav className="nav-links">
            <motion.a 
              href="#features" 
              className="nav-link"
              whileHover={{ 
                scale: 1.1,
                color: "#3b82f6"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Características
            </motion.a>
            <motion.a 
              href="#about" 
              className="nav-link"
              whileHover={{ 
                scale: 1.1,
                color: "#3b82f6"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Acerca de
            </motion.a>
            <motion.a 
              href="#team" 
              className="nav-link"
              whileHover={{ 
                scale: 1.1,
                color: "#3b82f6"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Equipo
            </motion.a>
            <motion.button 
              className="aritmetica-btn"
              onClick={() => navigate('/aritmetica')}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#10b981"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="btn-icon">🧮</span>
              Aritmética
            </motion.button>
            <motion.button 
              className="login-btn"
              onClick={() => navigate('/login')}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#1d4ed8"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="btn-icon">🔐</span>
              Iniciar Sesión
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="hero-badge"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <span className="badge-icon">✨</span>
              Tecnología de Vanguardia
            </motion.div>
            <motion.h1 
              className="hero-title"
              variants={itemVariants}
            >
              Reconocimiento Inteligente de 
              <motion.span 
                className="gradient-text"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {" "}Lenguaje de Señas
              </motion.span>
            </motion.h1>
            <motion.p 
              className="hero-description"
              variants={itemVariants}
            >
              Sistema avanzado de IA que utiliza MediaPipe y Machine Learning 
              para interpretar y reconocer lenguaje de señas en tiempo real con 
              precisión excepcional
            </motion.p>
            <motion.div 
              className="hero-stats"
              variants={containerVariants}
            >
              <motion.div 
                className="stat-item"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <span className="stat-number">95%</span>
                <span className="stat-label">Precisión</span>
              </motion.div>
              <motion.div 
                className="stat-item"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <span className="stat-number">&lt;100ms</span>
                <span className="stat-label">Latencia</span>
              </motion.div>
              <motion.div 
                className="stat-item"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <span className="stat-number">24/7</span>
                <span className="stat-label">Disponible</span>
              </motion.div>
            </motion.div>
            <motion.div 
              className="hero-buttons"
              variants={containerVariants}
            >
              <motion.button 
                className="btn-primary"
                onClick={() => navigate('/user-dashboard')}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">🚀</span>
                Comenzar Ahora
                <span className="btn-arrow">→</span>
              </motion.button>
              <motion.button 
                className="btn-secondary"
                onClick={() => navigate('/login')}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(255, 255, 255, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">⚡</span>
                Acceso Administrador
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="hero-visual"
            initial="initial"
            animate="animate"
            variants={slideInRight}
          >
            <div className="tech-showcase">
              <motion.div 
                className="tech-stack"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div 
                  className="tech-item"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="tech-icon-wrapper">
                    <motion.span 
                      className="tech-icon"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >🤖</motion.span>
                  </div>
                  <div className="tech-content">
                    <h4>Machine Learning</h4>
                    <p>Algoritmos avanzados</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="tech-item"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="tech-icon-wrapper">
                    <motion.span 
                      className="tech-icon"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >📷</motion.span>
                  </div>
                  <div className="tech-content">
                    <h4>Computer Vision</h4>
                    <p>Procesamiento visual</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="tech-item"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="tech-icon-wrapper">
                    <motion.span 
                      className="tech-icon"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >⚡</motion.span>
                  </div>
                  <div className="tech-content">
                    <h4>Tiempo Real</h4>
                    <p>Respuesta instantánea</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="tech-item"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="tech-icon-wrapper">
                    <motion.span 
                      className="tech-icon"
                      animate={{ rotateY: [0, 180, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >🔍</motion.span>
                  </div>
                  <div className="tech-content">
                    <h4>Alta Precisión</h4>
                    <p>Resultados confiables</p>
                  </div>
                </motion.div>
              </motion.div>
              <div className="floating-elements">
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="features-section"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            variants={containerVariants}
          >
            <motion.div 
              className="section-badge"
              variants={itemVariants}
            >
              <span className="badge-icon">⭐</span>
              Características
            </motion.div>
            <motion.h2 
              className="section-title"
              variants={itemVariants}
            >
              Potencia tu Comunicación
            </motion.h2>
            <motion.p 
              className="section-description"
              variants={itemVariants}
            >
              Descubre las funcionalidades que hacen de nuestro sistema la mejor opción 
              para el reconocimiento de lenguaje de señas
            </motion.p>
          </motion.div>
          <motion.div 
            className="features-grid"
            variants={staggerContainer}
          >
            <motion.div 
              className="feature-card"
              variants={scaleIn}
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="feature-icon">🎯</div>
              </motion.div>
              <div className="feature-content">
                <h3>Predicción en Tiempo Real</h3>
                <p>Reconoce señas instantáneamente usando tu cámara web con alta precisión y velocidad de procesamiento optimizada</p>
                <div className="feature-metrics">
                  <motion.span 
                    className="metric"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="metric-value">95%</span>
                    <span className="metric-label">Precisión</span>
                  </motion.span>
                  <motion.span 
                    className="metric"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="metric-value">&lt;100ms</span>
                    <span className="metric-label">Latencia</span>
                  </motion.span>
                </div>
              </div>
            </motion.div>
            
            {/* Repite el mismo patrón para las otras feature cards */}
            <motion.div 
              className="feature-card"
              variants={scaleIn}
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="feature-icon">📊</div>
              </motion.div>
              <div className="feature-content">
                <h3>Análisis de Datos</h3>
                <p>Visualiza el rendimiento de los modelos con gráficos interactivos, métricas detalladas y reportes comprehensivos</p>
                <div className="feature-list">
                  <span className="list-item">• Gráficos interactivos</span>
                  <span className="list-item">• Métricas en tiempo real</span>
                  <span className="list-item">• Reportes detallados</span>
                </div>
              </div>
            </motion.div>
            
            {/* Añade las otras dos feature cards con el mismo patrón */}
          </motion.div>
        </div>
      </motion.section>

      {/* Access Options */}
      <motion.section 
        className="access-section"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            variants={containerVariants}
          >
            <motion.div 
              className="section-badge"
              variants={itemVariants}
            >
              <span className="badge-icon">🚀</span>
              Modalidades
            </motion.div>
            <motion.h2 
              className="section-title"
              variants={itemVariants}
            >
              Elige tu Experiencia
            </motion.h2>
            <motion.p 
              className="section-description"
              variants={itemVariants}
            >
              Selecciona el modo que mejor se adapte a tus necesidades y comienza a explorar 
              las capacidades de nuestro sistema de reconocimiento
            </motion.p>
          </motion.div>
          <motion.div 
            className="access-cards"
            variants={staggerContainer}
          >
            <motion.div 
              className="access-card user-card"
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02
              }}
            >
              <div className="card-glow"></div>
              <div className="card-header">
                <motion.div 
                  className="card-icon-wrapper"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="card-icon">👤</span>
                </motion.div>
                <div className="card-title-section">
                  <h3>Modo Usuario</h3>
                  <motion.span 
                    className="card-badge free"
                    whileHover={{ scale: 1.1 }}
                  >
                    Gratuito
                  </motion.span>
                </div>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Perfecto para usuarios que quieren experimentar con el reconocimiento 
                  de señas de forma rápida y sencilla
                </p>
                <ul className="card-features">
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Predicción en tiempo real</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Visualización de resultados</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Gráficos de modelos</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Interfaz amigable</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Sin configuración</motion.li>
                </ul>
              </div>
              <div className="card-footer">
                <motion.button 
                  className="card-btn"
                  onClick={() => navigate('/user-dashboard')}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="btn-icon">🚀</span>
                  Comenzar como Usuario
                  <span className="btn-arrow">→</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="access-card admin-card featured"
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02
              }}
            >
              <motion.div 
                className="featured-badge"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span>Recomendado</span>
              </motion.div>
              <div className="card-glow"></div>
              <div className="card-header">
                <motion.div 
                  className="card-icon-wrapper"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="card-icon">⚡</span>
                </motion.div>
                <div className="card-title-section">
                  <h3>Modo Administrador</h3>
                  <motion.span 
                    className="card-badge premium"
                    whileHover={{ scale: 1.1 }}
                  >
                    Avanzado
                  </motion.span>
                </div>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Acceso completo a todas las funcionalidades avanzadas para 
                  profesionales y desarrolladores
                </p>
                <ul className="card-features">
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Todas las funciones de usuario</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Captura de datos de entrenamiento</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Entrenamiento de modelos</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Gestión de muestras</motion.li>
                  <motion.li
                    whileHover={{ x: 5 }}
                  >✅ Configuración avanzada</motion.li>
                </ul>
              </div>
              <div className="card-footer">
                <motion.button 
                  className="card-btn primary"
                  onClick={() => navigate('/login')}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.6)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="btn-icon">⚡</span>
                  Acceso Administrador
                  <span className="btn-arrow">→</span>
                </motion.button>
                <motion.div 
                  className="admin-credentials"
                  whileHover={{ scale: 1.05 }}
                >
              
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        id="team" 
        className="team-section"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container">
          <motion.div 
            className="section-header"
            variants={containerVariants}
          >
            <motion.div 
              className="section-badge"
              variants={itemVariants}
            >
              <span className="badge-icon">👥</span>
              Equipo
            </motion.div>
            <motion.h2 
              className="section-title"
              variants={itemVariants}
            >
              Conoce a Nuestro Equipo
            </motion.h2>
            <motion.p 
              className="section-description"
              variants={itemVariants}
            >
              Un grupo de estudiantes apasionados por la tecnología y la innovación, 
              comprometidos con crear soluciones que marquen la diferencia
            </motion.p>
          </motion.div>
          <motion.div 
            className="team-grid"
            variants={staggerContainer}
          >
            {/* ProfileCards con animaciones */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -5 }}
            >
              <ProfileCard
                avatarUrl="/team1.jpg"
                miniAvatarUrl="/team1-mini.jpg"
                name="Valentino Cuenca"
                title="Backend Developer"
                handle="andriubv"
                status="Online"
                contactText="Contáctame"
                onContactClick={() => alert("Contacto Integrante 1")}
              />
            </motion.div>
              <ProfileCard
              avatarUrl="/team2.jpg"
              miniAvatarUrl="/team1-mini.jpg"
              name="Jair Capuñay"
              title="Backend Developer"
              handle="jakeey"
              status="Online"
              contactText="Contáctame"
              onContactClick={() => alert("Contacto Integrante 1")}
            />
            <ProfileCard
              avatarUrl="/team3.jpg"
              miniAvatarUrl="/team2-mini.jpg"
              name="Cesar Dominguez"
              title="Frontend Developer"
              handle="cesardt"
              status="Offline"
              contactText="Contáctame"
              onContactClick={() => alert("Contacto Integrante 2")}
            />
            <ProfileCard
              avatarUrl="/team4.jpg"
              miniAvatarUrl="/team3-mini.jpg"
              name="Williams Delgado"
              title="Backend Developer"
              handle="@integrante3"
              status="Online"
              contactText="Contáctame"
              onContactClick={() => alert("Contacto Integrante 3")}
            />
            <ProfileCard
              avatarUrl="/team5.jpg"
              miniAvatarUrl="/team4-mini.jpg"
              name="Angel Morales"
              title="Frontend Developer"
              handle="@integrante4"
              status="Online"
              contactText="Contáctame"
              onContactClick={() => alert("Contacto Integrante 4")}
            />
            <ProfileCard
              avatarUrl="/team6.jpg"
              miniAvatarUrl="/team5-mini.jpg"
              name="Anderson Aponte"
              title="Frontend Developer"
              handle="@integrante5"
              status="Offline"
              contactText="Contáctame"
              onContactClick={() => alert("Contacto Integrante 5")}
            />
            {/* Repite para los otros miembros del equipo */}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="homepage-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="footer-background">
          <div className="footer-gradient"></div>
        </div>
        <div className="container">
          <motion.div 
            className="footer-content"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="footer-main">
              <motion.div 
                className="footer-brand"
                variants={itemVariants}
              >
                <motion.img 
                  src="/innova.png" 
                  alt="Innova Tec" 
                  className="footer-logo"
                  whileHover={{ rotate: 5 }}
                />
                <div className="brand-info">
                  <h3>Innova Tec</h3>
                  <p>Vision&Señas-IA</p>
                  <span className="brand-tagline">Innovación en cada gesto</span>
                </div>
              </motion.div>
              <motion.div 
                className="footer-sections"
                variants={containerVariants}
              >
                <motion.div 
                  className="footer-section"
                  variants={itemVariants}
                >
                  <h4>Producto</h4>
                  <div className="footer-links">
                    <motion.a 
                      href="#features" 
                      className="footer-link"
                      whileHover={{ x: 5, color: "#3b82f6" }}
                    >Características</motion.a>
                    <motion.a 
                      href="/user-dashboard" 
                      className="footer-link"
                      whileHover={{ x: 5, color: "#3b82f6" }}
                    >Modo Usuario</motion.a>
                    <motion.a 
                      href="/login" 
                      className="footer-link"
                      whileHover={{ x: 5, color: "#3b82f6" }}
                    >Administrador</motion.a>
                  </div>
                </motion.div>
                {/* Repite para las otras secciones del footer */}
              </motion.div>
            </div>
          </motion.div>
          <motion.div 
            className="footer-bottom"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="footer-bottom-content">
              <p>&copy; 2025 Innova Tec. Todos los derechos reservados.</p>
              <div className="footer-social">
                <span className="social-text">Síguenos:</span>
                <div className="social-links">
                  <motion.a 
                    href="#" 
                    className="social-link"
                    whileHover={{ scale: 1.2, y: -2 }}
                  >📧</motion.a>
                  <motion.a 
                    href="#" 
                    className="social-link"
                    whileHover={{ scale: 1.2, y: -2 }}
                  >🐦</motion.a>
                  <motion.a 
                    href="#" 
                    className="social-link"
                    whileHover={{ scale: 1.2, y: -2 }}
                  >💼</motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Homepage;