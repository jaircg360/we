import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Aritmetica.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Aritmetica = () => {
  const navigate = useNavigate();
  const [operaciones, setOperaciones] = useState([]);
  const [operacionActual, setOperacionActual] = useState('suma');
  const [frameData, setFrameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const canvasRef = useRef(null);

  // Animaciones
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

  // Cargar operaciones disponibles
  useEffect(() => {
    const cargarOperaciones = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/matematicas/operaciones`);
        setOperaciones(response.data.operaciones);
      } catch (error) {
        console.error('Error cargando operaciones:', error);
        setError('Error cargando operaciones disponibles');
      }
    };

    cargarOperaciones();
  }, []);

  // Función para obtener frame
  const obtenerFrame = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/matematicas/frame`, {
        params: { operacion: operacionActual }
      });
      setFrameData(response.data);
      
      // Dibujar frame en canvas
      if (canvasRef.current && response.data.frame) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = 800;
          canvas.height = 600;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        
        img.src = `data:image/jpeg;base64,${response.data.frame}`;
      }
    } catch (error) {
      console.error('Error obteniendo frame:', error);
      setError('Error obteniendo frame de la cámara');
    }
  };

  // Iniciar/detener streaming
  const toggleStreaming = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    } else {
      setIsLoading(true);
      const id = setInterval(obtenerFrame, 100); // 10 FPS
      setIntervalId(id);
      obtenerFrame(); // Primer frame inmediato
    }
  };

  // Cambiar operación
  const cambiarOperacion = async (nuevaOperacion) => {
    setOperacionActual(nuevaOperacion);
    try {
      await axios.post(`${API_BASE_URL}/api/matematicas/operacion`, null, {
        params: { operacion: nuevaOperacion }
      });
    } catch (error) {
      console.error('Error cambiando operación:', error);
      setError('Error cambiando operación');
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Actualizar isLoading cuando se obtiene el primer frame
  useEffect(() => {
    if (frameData && isLoading) {
      setIsLoading(false);
    }
  }, [frameData, isLoading]);

  const operacionInfo = operaciones.find(op => op.id === operacionActual);

  return (
    <div className="aritmetica-container">
      <motion.div 
        className="aritmetica-header"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="header-content" variants={itemVariants}>
          <div className="header-title">
            <motion.button 
              className="back-btn"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Volver
            </motion.button>
            <div className="title-section">
              <h1>🧮 Aritmética con Señas</h1>
              <p>Realiza operaciones matemáticas usando lenguaje de señas</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="aritmetica-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Panel de Control */}
        <motion.div className="control-panel" variants={itemVariants}>
          <div className="operaciones-selector">
            <h3>Seleccionar Operación</h3>
            <div className="operaciones-grid">
              {operaciones.map((operacion) => (
                <motion.button
                  key={operacion.id}
                  className={`operacion-btn ${operacionActual === operacion.id ? 'active' : ''}`}
                  onClick={() => cambiarOperacion(operacion.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="operacion-simbolo">{operacion.simbolo}</span>
                  <span className="operacion-nombre">{operacion.nombre}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="streaming-controls">
            <motion.button
              className={`stream-btn ${intervalId ? 'active' : ''}`}
              onClick={toggleStreaming}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {intervalId ? '⏹️ Detener' : '▶️ Iniciar'} Streaming
            </motion.button>
          </div>

          {operacionInfo && (
            <div className="operacion-info">
              <h4>Operación Actual: {operacionInfo.nombre}</h4>
              <p>{operacionInfo.descripcion}</p>
              <div className="operacion-status">
                <span className="status-indicator">●</span>
                <span>Activa</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Área de Visualización */}
        <motion.div className="visualization-area" variants={itemVariants}>
          <div className="camera-container">
            <div className="camera-header">
              <h3>Vista en Tiempo Real</h3>
              <div className="camera-status">
                <span className={`status-indicator ${intervalId ? 'active' : 'inactive'}`}>
                  {intervalId ? '● Transmitiendo' : '○ Detenido'}
                </span>
              </div>
            </div>

            <div className="camera-preview">
              <canvas 
                ref={canvasRef}
                className="camera-feed"
                width="800"
                height="600"
              />
              
              {isLoading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <span>Iniciando cámara...</span>
                </div>
              )}

              {!intervalId && (
                <div className="instructions-overlay">
                  <div className="instructions-content">
                    <h4>Instrucciones</h4>
                    <ul>
                      <li>1. Haz clic en "Iniciar Streaming"</li>
                      <li>2. Muestra números del 1 al 5 con cada mano</li>
                      <li>3. El sistema calculará automáticamente</li>
                      <li>4. Mano izquierda = número izquierdo</li>
                      <li>5. Mano derecha = número derecho</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          {frameData && (
            <motion.div 
              className="results-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h4>Resultados</h4>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Mano Izquierda:</span>
                  <span className="result-value">{frameData.izquierda}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Mano Derecha:</span>
                  <span className="result-value">{frameData.derecha}</span>
                </div>
                <div className="result-item resultado">
                  <span className="result-label">Resultado:</span>
                  <span className="result-value">{frameData.resultado}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Mensajes de Error */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setError(null)}
        >
          ⚠️ {error}
        </motion.div>
      )}
    </div>
  );
};

export default Aritmetica;
