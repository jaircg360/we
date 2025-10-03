import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as mpHands from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useNavigate } from 'react-router-dom';
import ModelCharts from '../ModelCharts/ModelCharts';
import './UserDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const UserDashboard = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allPredictions, setAllPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingHand, setIsDetectingHand] = useState(false);
  const [handsDetected, setHandsDetected] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [samplesInfo, setSamplesInfo] = useState({ total_samples: 0, samples_per_class: {} });

  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  // Inicializar MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Verificar que los elementos estén disponibles
        if (!videoRef.current || !canvasRef.current) {
          console.warn('Elementos de video o canvas no disponibles');
          return;
        }

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
          
          // Verificar que canvas y contexto estén disponibles
          if (!canvas || !ctx) {
            console.warn('Canvas o contexto no disponible');
            return;
          }

          // Asegurar dimensiones del canvas
          if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = 640;
            canvas.height = 480;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Verificar que la imagen esté disponible
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
            width: 640,
            height: 480
          });
          
          await cameraRef.current.start();
        }

      } catch (error) {
        console.error('Error inicializando MediaPipe:', error);
        setError('Error inicializando la cámara: ' + error.message);
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
    };
  }, []);

  // Cargar modelos y información
  useEffect(() => {
    fetchModels();
    fetchSamplesInfo();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/models`);
      setModels(response.data.models || []);
      if (response.data.models?.length > 0) {
        setSelectedModel(response.data.models[0].name);
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      setError('Error cargando modelos: ' + error.message);
    }
  };

  const fetchSamplesInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/samples`);
      setSamplesInfo(response.data);
    } catch (error) {
      console.error('Error cargando información de muestras:', error);
    }
  };

  const captureFrame = () => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Verificar que el video esté listo
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, 'image/jpeg', 0.9);
        } else {
          console.warn('Video no listo para captura');
          resolve(null);
        }
      } catch (error) {
        console.error('Error capturando frame:', error);
        resolve(null);
      }
    });
  };

  const predictImage = async () => {
    if (!selectedModel) {
      setError('Por favor selecciona un modelo');
      return;
    }

    if (!isDetectingHand) {
      setError('No se detecta mano. Muestra tu mano frente a la cámara.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const blob = await captureFrame();
      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'predict.jpg');
        formData.append('model', selectedModel);

        const response = await axios.post(`${API_BASE_URL}/api/predict`, formData);
        const data = response.data;
        
        setPrediction(data.prediction);
        setConfidence(data.confidence);
        setAllPredictions(data.all_predictions || []);
        setSuccess(`Predicción: ${data.prediction} (${(data.confidence * 100).toFixed(1)}% confianza)`);
      } else {
        setError('No se pudo capturar la imagen para predicción');
      }
    } catch (error) {
      setError('Error en predicción: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="user-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/innova.png" alt="Innova Tec" className="logo" />
            <div className="brand-text">
              <h1>Vision&Señas-IA</h1>
              <span>Modo Usuario</span>
            </div>
          </div>
          <nav className="user-nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/')}
            >
              🏠 Inicio
            </button>
            <button 
              className="nav-btn"
              onClick={() => navigate('/aritmetica')}
            >
              🧮 Aritmética
            </button>
            <button 
              className="nav-btn admin-btn"
              onClick={() => navigate('/login')}
            >
              ⚡ Administrador
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="user-main">
        <div className="container">
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

          <div className="dashboard-grid">
            {/* Camera Section */}
            <div className="camera-section">
              <div className="section-header">
                <h2>👁️ Vista en Tiempo Real</h2>
                <div className="camera-status">
                  <span className={`status-badge ${isDetectingHand ? 'detecting' : 'waiting'}`}>
                    {isDetectingHand ? '● Detectando' : '○ Esperando'}
                  </span>
                  <span className="hands-count">{handsDetected} mano(s)</span>
                </div>
              </div>
              
              <div className="camera-preview">
                <video 
                  ref={videoRef} 
                  style={{ display: 'none' }} 
                  playsInline 
                />
                <canvas 
                  ref={canvasRef} 
                  className="camera-feed" 
                  width="640" 
                  height="480" 
                />
                
                {isLoading && (
                  <div className="camera-overlay">
                    <div className="spinner"></div>
                    <span>Procesando...</span>
                  </div>
                )}
              </div>

              <div className="prediction-controls">
                <div className="model-selector">
                  <label>Modelo de Reconocimiento:</label>
                  <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="model-select"
                  >
                    <option value="">Selecciona un modelo</option>
                    {models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.accuracy * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="predict-btn"
                  onClick={predictImage}
                  disabled={isLoading || !selectedModel || !isDetectingHand}
                >
                  {isLoading ? '🔮 Analizando...' : '🔍 Predecir Seña'}
                </button>

                {!isDetectingHand && (
                  <div className="detection-hint">
                    💡 Muestra tu mano frente a la cámara para habilitar la predicción
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="results-section">
              <div className="section-header">
                <h2>📊 Resultados</h2>
              </div>

              {prediction ? (
                <div className="prediction-result">
                  <div className="result-card">
                    <div className="result-main">
                      <span className="prediction-symbol">{prediction}</span>
                      <span className="confidence-level">
                        {(confidence * 100).toFixed(1)}% de confianza
                      </span>
                    </div>
                    <div className="result-details">
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                      
                      {allPredictions.length > 0 && (
                        <div className="alternative-predictions">
                          <h5>Otras posibles señas:</h5>
                          {allPredictions.slice(0, 3).map((pred, index) => (
                            <div key={index} className="alt-prediction">
                              <span className="alt-class">{pred.class}</span>
                              <span className="alt-confidence">
                                {(pred.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-prediction">
                  <div className="placeholder-card">
                    <span className="placeholder-icon">🔍</span>
                    <h3>Sin predicciones</h3>
                    <p>Haz clic en "Predecir Seña" para analizar la mano detectada</p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-card">
                  <span className="stat-number">{models.length}</span>
                  <span className="stat-label">Modelos Disponibles</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{samplesInfo.total_samples || 0}</span>
                  <span className="stat-label">Muestras Totales</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {samplesInfo.samples_per_class ? Object.keys(samplesInfo.samples_per_class).length : 0}
                  </span>
                  <span className="stat-label">Señas Diferentes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Charts Section */}
          {models.length > 0 && (
            <ModelCharts samplesInfo={samplesInfo} models={models} />
          )}

          {/* Instructions */}
          <div className="instructions-section">
            <h3>💡 Cómo usar el sistema</h3>
            <div className="instructions-grid">
              <div className="instruction">
                <span className="step">1</span>
                <p>Asegúrate de que tu cámara esté funcionando y tenga permisos</p>
              </div>
              <div className="instruction">
                <span className="step">2</span>
                <p>Muestra una mano frente a la cámara (debe aparecer "Detectando")</p>
              </div>
              <div className="instruction">
                <span className="step">3</span>
                <p>Selecciona un modelo de la lista desplegable</p>
              </div>
              <div className="instruction">
                <span className="step">4</span>
                <p>Haz clic en "Predecir Seña" para analizar</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;