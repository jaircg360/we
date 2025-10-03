import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import * as mpHands from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useNavigate } from 'react-router-dom';
import ModelCharts from '../ModelCharts/ModelCharts';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://wa-b6c3.onrender.com';

// Configuración global de axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000; // 30 segundos timeout

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error de API:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: El servidor está tardando demasiado en responder');
    }
    if (!error.response) {
      throw new Error('Error de conexión: No se pudo conectar al servidor');
    }
    throw error;
  }
);

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const [currentCategory, setCurrentCategory] = useState('vocales');
  const [label, setLabel] = useState('A');
  const [samplesInfo, setSamplesInfo] = useState({ total_samples: 0, samples_per_class: {} });
  const [modelName, setModelName] = useState('modelo_senas_v1');
  const [models, setModels] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allPredictions, setAllPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('capture');
  const [isDetectingHand, setIsDetectingHand] = useState(false);
  const [handsDetected, setHandsDetected] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estados para grabación
  const [isRecording, setIsRecording] = useState(false);
  const [capturesCount, setCapturesCount] = useState(0);
  const [recordingLabel, setRecordingLabel] = useState('A');
  const [recordingInterval, setRecordingInterval] = useState(1000);
  const recordingIntervalRef = useRef(null);
  const capturesQueueRef = useRef([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  // Definición de categorías y símbolos
  const categories = {
    vocales: { 
      name: 'Vocales', 
      symbols: ['A', 'E', 'I', 'O', 'U'], 
      icon: '🔤', 
      color: '#3B82F6' 
    },
    abecedario: { 
      name: 'Abecedario', 
      symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 
      icon: '🔡', 
      color: '#10B981' 
    },
    numeros: { 
      name: 'Números', 
      symbols: '0123456789'.split(''), 
      icon: '🔢', 
      color: '#F59E0B' 
    },
    operaciones: { 
      name: 'Operaciones', 
      symbols: ['+', '-', '×', '÷', '=', '%'], 
      icon: '➕', 
      color: '#EF4444' 
    }
  };

  // ==================== MEDIAPIPE IMPLEMENTACIÓN ====================

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Verificar que todos los elementos estén disponibles
        if (!videoRef.current || !canvasRef.current) {
          console.warn('Elementos de video o canvas no disponibles');
          return;
        }

        setIsLoading(true);
        
        // Inicializar Hands
        handsRef.current = new mpHands.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        handsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handsRef.current.onResults((results) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          
          // Verificar que canvas y context estén disponibles
          if (!canvas || !ctx) {
            console.warn('Canvas o contexto no disponible');
            return;
          }

          // Asegurarse de que el canvas tenga dimensiones válidas
          if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = 800;
            canvas.height = 600;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Verificar que la imagen esté disponible antes de dibujar
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          }
          
          if (results.multiHandLandmarks) {
            setHandsDetected(results.multiHandLandmarks.length);
            setIsDetectingHand(results.multiHandLandmarks.length > 0);
            
            results.multiHandLandmarks.forEach(landmarks => {
              drawConnectors(ctx, landmarks, mpHands.HAND_CONNECTIONS, 
                { color: '#00FF00', lineWidth: 2 });
              drawLandmarks(ctx, landmarks, 
                { color: '#FF0000', lineWidth: 1, radius: 3 });
            });
          } else {
            setHandsDetected(0);
            setIsDetectingHand(false);
          }
        });

        // Inicializar cámara
        if (videoRef.current) {
          // Detener cámara anterior si existe
          if (cameraRef.current) {
            cameraRef.current.stop();
          }

          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                try {
                  await handsRef.current.send({ image: videoRef.current });
                } catch (error) {
                  console.error('Error enviando frame a MediaPipe:', error);
                }
              }
            },
            width: 800,
            height: 600
          });
          
          await cameraRef.current.start();
        }

      } catch (error) {
        console.error('Error inicializando MediaPipe:', error);
        setError('Error inicializando la cámara: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeño delay para asegurar que los elementos del DOM estén montados
    const timer = setTimeout(() => {
      initializeMediaPipe();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Limpiar recursos
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // ==================== FUNCIONES DE CAPTURA ====================

  const captureFrame = async () => {
    try {
      const cap = captureCanvasRef.current;
      if (!cap) {
        console.warn('Canvas de captura no disponible');
        return null;
      }

      const ctx = cap.getContext('2d');
      if (!ctx) {
        console.warn('Contexto de canvas no disponible');
        return null;
      }

      // Asegurar dimensiones del canvas de captura
      if (cap.width === 0 || cap.height === 0) {
        cap.width = 800;
        cap.height = 600;
      }

      ctx.clearRect(0, 0, cap.width, cap.height);
      
      // Verificar que el video esté listo
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        ctx.drawImage(videoRef.current, 0, 0, cap.width, cap.height);
      } else {
        console.warn('Video no listo para captura');
        return null;
      }
      
      return new Promise((resolve) => {
        cap.toBlob(resolve, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error capturando frame:', error);
      return null;
    }
  };

  const processCaptureQueue = useCallback(async () => {
    if (isProcessingQueue || capturesQueueRef.current.length === 0) return;

    setIsProcessingQueue(true);
    
    try {
      const { label, blob } = capturesQueueRef.current.shift();
      
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');
      formData.append('label', label);

      const response = await axios.post(`${API_BASE_URL}/api/upload_sample`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setCapturesCount(prev => prev - 1);
        await fetchSamplesInfo();
      }

    } catch (error) {
      console.error('Error procesando captura:', error);
      setError('Error subiendo muestra: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTimeout(() => {
        setIsProcessingQueue(false);
        if (capturesQueueRef.current.length > 0) {
          processCaptureQueue();
        }
      }, 200);
    }
  }, [isProcessingQueue]);

  const toggleRecording = () => {
    if (isRecording) {
      // Parar grabación
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setSuccess(`Grabación finalizada. Se procesaron ${capturesCount} capturas.`);
    } else {
      // Iniciar grabación
      if (!isDetectingHand) {
        setError('No se detecta mano. No se puede iniciar grabación.');
        return;
      }
      
      // Usar el label actual para la grabación
      const currentRecordingLabel = label;
      setIsRecording(true);
      setCapturesCount(0);
      capturesQueueRef.current = [];
      
      recordingIntervalRef.current = setInterval(async () => {
        const blob = await captureFrame();
        if (blob) {
          capturesQueueRef.current.push({
            label: currentRecordingLabel, // Usar el label actual
            blob: blob
          });
          setCapturesCount(prev => prev + 1);
          processCaptureQueue();
        }
      }, recordingInterval);
      
      setSuccess(`Grabación iniciada para: ${currentRecordingLabel}`);
    }
  };

  const captureSingleImage = async () => {
    if (!isDetectingHand) {
      setError('No se detecta mano. No se puede capturar.');
      return;
    }

    setIsLoading(true);
    try {
      const blob = await captureFrame();
      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        formData.append('label', label);

        const response = await axios.post(`${API_BASE_URL}/api/upload_sample`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.status === 'success') {
          setSuccess(`Imagen capturada para: ${label}`);
          await fetchSamplesInfo();
        }
      } else {
        setError('No se pudo capturar la imagen');
      }
    } catch (error) {
      setError('Error capturando imagen: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FUNCIONES DE MODELO ====================

  const trainModel = async () => {
    if (!modelName.trim()) {
      setError('Por favor ingresa un nombre para el modelo');
      return;
    }

    if (!samplesInfo.total_samples || samplesInfo.total_samples < 10) {
      setError('Se necesitan al menos 10 muestras para entrenar el modelo');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', modelName);

      const response = await axios.post(`${API_BASE_URL}/api/train`, formData);
      const data = response.data;
      
      setSuccess(`Modelo "${modelName}" entrenado con precisión: ${(data.accuracy * 100).toFixed(2)}%`);
      await fetchModels();
      
    } catch (error) {
      setError('Error entrenando modelo: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const predictImage = async () => {
    if (!modelName) {
      setError('Por favor selecciona un modelo');
      return;
    }

    if (!isDetectingHand) {
      setError('No se detecta mano. No se puede predecir.');
      return;
    }

    setIsLoading(true);
    try {
      const blob = await captureFrame();
      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'predict.jpg');
        formData.append('model', modelName);

        const response = await axios.post(`${API_BASE_URL}/api/predict`, formData);
        const data = response.data;
        
        setPrediction(data.prediction);
        setConfidence(data.confidence);
        setAllPredictions(data.all_predictions || []);
        setSuccess(data.message);
      } else {
        setError('No se pudo capturar la imagen para predicción');
      }
    } catch (error) {
      setError('Error en predicción: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FUNCIONES DE DATOS ====================

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/models`);
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Error cargando modelos: ' + error.message);
    }
  };

  const fetchSamplesInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/samples`);
      setSamplesInfo(response.data);
    } catch (error) {
      console.error('Error fetching samples info:', error);
    }
  };

  const clearSamples = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/clear_samples`);
      setSamplesInfo({ total_samples: 0, samples_per_class: {} });
      setSuccess('Todas las muestras han sido eliminadas');
    } catch (error) {
      setError('Error eliminando muestras: ' + error.message);
    }
  };

  const deleteModel = async (modelToDelete) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el modelo "${modelToDelete}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/model/${modelToDelete}`);
      setSuccess(`Modelo "${modelToDelete}" eliminado correctamente`);
      await fetchModels();
    } catch (error) {
      setError('Error eliminando modelo: ' + error.message);
    }
  };

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchModels();
    fetchSamplesInfo();
    
    const interval = setInterval(() => {
      fetchSamplesInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sincronizar recordingLabel con label cuando cambie y no esté grabando
  useEffect(() => {
    if (!isRecording) {
      setRecordingLabel(label);
    }
  }, [label, isRecording]);

  // ==================== RENDERIZADO ====================

  const renderCaptureTab = () => (
    <div className="tab-content">
      <div className="category-selector">
        <h4>Seleccionar Categoría</h4>
        <div className="category-buttons">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`category-btn ${currentCategory === key ? 'active' : ''}`}
              onClick={() => {
                setCurrentCategory(key);
                const newSymbol = category.symbols[0];
                setLabel(newSymbol);
                setRecordingLabel(newSymbol);
              }}
              style={{ '--category-color': category.color }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="symbol-selector">
        <h4>Seleccionar Símbolo</h4>
        <div className="symbol-grid">
          {categories[currentCategory]?.symbols.map((symbol) => (
            <button
              key={symbol}
              className={`symbol-btn ${label === symbol ? 'active' : ''}`}
              onClick={() => {
                setLabel(symbol);
                setRecordingLabel(symbol);
              }}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="capture-controls">
        <div className="control-group">
          <button 
            className="capture-btn primary"
            onClick={captureSingleImage}
            disabled={!isDetectingHand || isLoading}
          >
            {isLoading ? '📸 Capturando...' : '📸 Capturar Imagen'}
          </button>
          
          <div className="recording-controls">
            <button 
              className={`capture-btn ${isRecording ? 'recording' : 'secondary'}`}
              onClick={toggleRecording}
              disabled={!isDetectingHand || isLoading}
            >
              {isRecording ? '⏹️ Parar Grabación' : '🎥 Iniciar Grabación'}
            </button>
            
            {isRecording && (
              <div className="recording-info">
                <div className="recording-dot"></div>
                <span>Grabando: {label}</span>
                <span className="capture-count">{capturesCount} en cola</span>
              </div>
            )}
          </div>
        </div>

        <div className="interval-control">
          <label>Intervalo de grabación (ms):</label>
          <input
            type="number"
            value={recordingInterval}
            onChange={(e) => setRecordingInterval(Number(e.target.value))}
            min="500"
            max="5000"
            step="100"
            disabled={isRecording}
          />
        </div>
      </div>

      <div className="samples-info">
        <h4>Muestras Recolectadas</h4>
        <div className="samples-stats">
          <div className="stat-card total">
            <span className="stat-number">{samplesInfo.total_samples || 0}</span>
            <span className="stat-label">Total</span>
          </div>
          {samplesInfo.samples_per_class && Object.entries(samplesInfo.samples_per_class).map(([cls, count]) => (
            <div key={cls} className="stat-card">
              <span className="stat-number">{count}</span>
              <span className="stat-label">{cls}</span>
            </div>
          ))}
        </div>
        <button 
          className="clear-btn" 
          onClick={clearSamples}
          disabled={!samplesInfo.total_samples}
        >
          🗑️ Limpiar Muestras
        </button>
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="tab-content">
      <div className="training-controls">
        <div className="input-group">
          <label>Nombre del Modelo:</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Ej: lenguaje_senas_v1"
            className="model-input"
          />
        </div>

        <div className="training-stats">
          <div className="stat-item">
            <span className="stat-label">Muestras totales:</span>
            <span className="stat-value">{samplesInfo.total_samples || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Clases:</span>
            <span className="stat-value">
              {samplesInfo.samples_per_class ? Object.keys(samplesInfo.samples_per_class).length : 0}
            </span>
          </div>
        </div>

        <button 
          className="train-btn primary"
          onClick={trainModel}
          disabled={isLoading || !samplesInfo.total_samples || samplesInfo.total_samples < 10}
        >
          {isLoading ? '⚡ Entrenando...' : '🤖 Entrenar Modelo'}
        </button>

        {samplesInfo.total_samples < 10 && (
          <div className="warning-message">
            ⚠️ Se necesitan al menos 10 muestras para entrenar
          </div>
        )}

        <div className="training-info">
          <h4>Modelos Disponibles</h4>
          <div className="models-list">
            {models.map((model) => (
              <div key={model.name} className="model-card">
                <div className="model-info">
                  <h5>{model.name}</h5>
                  <div className="model-details">
                    <span className="accuracy">Precisión: {(model.accuracy * 100).toFixed(2)}%</span>
                    <span className="samples">Muestras: {model.n_samples}</span>
                    <span className="classes">Clases: {model.classes?.join(', ')}</span>
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteModel(model.name)}
                  title="Eliminar modelo"
                >
                  🗑️
                </button>
              </div>
            ))}
            {models.length === 0 && (
              <p className="no-models">No hay modelos entrenados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictionTab = () => (
    <div className="tab-content">
      <div className="prediction-controls">
        <div className="input-group">
          <label>Seleccionar Modelo:</label>
          <select 
            value={modelName} 
            onChange={(e) => setModelName(e.target.value)}
            className="model-select"
          >
            <option value="">Selecciona un modelo</option>
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name} ({(model.accuracy * 100).toFixed(2)}%)
              </option>
            ))}
          </select>
        </div>

        <button 
          className="predict-btn primary"
          onClick={predictImage}
          disabled={isLoading || !modelName || !isDetectingHand}
        >
          {isLoading ? '🔮 Prediciendo...' : '🔍 Predecir'}
        </button>

        {!isDetectingHand && (
          <div className="warning-message">
            ⚠️ Mostrar la mano frente a la cámara para predecir
          </div>
        )}

        {prediction && (
          <div className="prediction-result">
            <h4>Resultado de la Predicción</h4>
            <div className="prediction-card">
              <div className="prediction-main">
                <span className="prediction-symbol">{prediction}</span>
                <span className="prediction-confidence">
                  {(confidence * 100).toFixed(2)}% de confianza
                </span>
              </div>
              
              {allPredictions && allPredictions.length > 0 && (
                <div className="all-predictions">
                  <h5>Otras predicciones:</h5>
                  {allPredictions.map((pred, index) => (
                    <div key={index} className="prediction-item">
                      <span className="pred-class">{pred.class}</span>
                      <span className="pred-confidence">{(pred.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <img src="/innova.png" alt="Innova Tec" className="logo" />
            <div className="brand-text">
              <h1>Innova Tec</h1>
              <span>Vision&Señas-IA</span>
            </div>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'capture' ? 'active' : ''}`} 
            onClick={() => setActiveTab('capture')}
          >
            <span className="nav-icon">📷</span>
            {isSidebarOpen && <span className="nav-text">Captura</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'training' ? 'active' : ''}`} 
            onClick={() => setActiveTab('training')}
          >
            <span className="nav-icon">🤖</span>
            {isSidebarOpen && <span className="nav-text">Entrenamiento</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'prediction' ? 'active' : ''}`} 
            onClick={() => setActiveTab('prediction')}
          >
            <span className="nav-icon">🔍</span>
            {isSidebarOpen && <span className="nav-text">Predicción</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-info">
            <div className={`status-indicator ${isDetectingHand ? 'active' : ''}`}>
              <div className="status-dot"></div>
              {isSidebarOpen && (
                <span className="status-text">
                  {isDetectingHand ? `${handsDetected} mano(s) detectada(s)` : 'Esperando...'}
                </span>
              )}
            </div>
            <div className="samples-count">
              {isSidebarOpen && `Muestras: ${samplesInfo.total_samples || 0}`}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h2>
              {activeTab === 'capture' && 'Captura de Datos de Señas'}
              {activeTab === 'training' && 'Entrenamiento de Modelos'}
              {activeTab === 'prediction' && 'Reconocimiento en Tiempo Real'}
            </h2>
            <p>
              Sistema de reconocimiento de lenguaje de señas usando MediaPipe y Machine Learning
            </p>
          </div>
          
          <div className="header-actions">
            <div className="user-info">
              <span className="welcome-text">Bienvenido, {user?.name || 'Administrador'}</span>
              <button 
                className="nav-btn"
                onClick={() => navigate('/user-dashboard')}
              >
                👤 Modo Usuario
              </button>
              <button 
                className="nav-btn"
                onClick={() => navigate('/aritmetica')}
              >
                🧮 Aritmética
              </button>
              <button 
                className="nav-btn"
                onClick={() => navigate('/')}
              >
                🏠 Inicio
              </button>
              <button 
                onClick={onLogout} 
                className="logout-btn"
                title="Cerrar sesión"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
            <div className="models-count">
              {models.length} modelo(s) entrenado(s)
            </div>
            <div className="time-display">{new Date().toLocaleTimeString()}</div>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          {error && (
            <div className="message error" onClick={() => setError(null)}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="message success" onClick={() => setSuccess(null)}>
              ✅ {success}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="main-section">
            <div className="camera-container">
              <div className="camera-header">
                <h3>Vista en Tiempo Real</h3>
                <div className="camera-status">
                  <span className={`status-badge ${isDetectingHand ? 'detecting' : 'waiting'}`}>
                    {isDetectingHand ? '● Detectando' : '○ Esperando'}
                  </span>
                  <span className="hands-count">{handsDetected} mano(s)</span>
                </div>
              </div>
              
              <div className="camera-preview-large">
                <video 
                  ref={videoRef} 
                  style={{ display: 'none' }} 
                  playsInline 
                />
                <canvas 
                  ref={canvasRef} 
                  className="camera-feed-large" 
                  width="800" 
                  height="600" 
                />
                <canvas 
                  ref={captureCanvasRef} 
                  style={{ display: 'none' }} 
                  width="800" 
                  height="600" 
                />
                
                {isLoading && (
                  <div className="camera-overlay">
                    <div className="spinner"></div>
                    <span>Procesando...</span>
                  </div>
                )}
              </div>
              
              <div className="camera-info">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span className={`info-value ${isDetectingHand ? 'active' : 'inactive'}`}>
                      {isDetectingHand ? '● Detectando' : '○ Esperando'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Manos detectadas:</span>
                    <span className="info-value">{handsDetected}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Muestras totales:</span>
                    <span className="info-value">{samplesInfo.total_samples || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Modelos:</span>
                    <span className="info-value">{models.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="controls-panel">
            {activeTab === 'capture' && renderCaptureTab()}
            {activeTab === 'training' && renderTrainingTab()}
            {activeTab === 'prediction' && renderPredictionTab()}
          </div>
        </div>

        {/* Model Charts Section - REUTILIZABLE */}
        {models.length > 0 && (
          <ModelCharts samplesInfo={samplesInfo} models={models} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
