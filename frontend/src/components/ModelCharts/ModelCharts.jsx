import React from 'react';
import './ModelCharts.css';

const ModelCharts = ({ samplesInfo, models }) => {
  // Calcular datos para los gráficos
  const getChartData = () => {
    if (!models || models.length === 0 || !samplesInfo) {
      return {
        accuracyTrend: [],
        samplesDistribution: [],
        confidenceLevels: []
      };
    }

    // Tendencia de precisión
    const accuracyTrend = models.map((model, index) => {
      const acc = Number(model.accuracy);
      const samples = Number(model.n_samples);
      return {
        name: `M${index + 1}`,
        accuracy: !isNaN(acc) ? acc * 100 : 0,
        samples: !isNaN(samples) ? samples : 0,
        modelName: model.name || `Modelo ${index + 1}`
      };
    }).filter(item => !isNaN(item.accuracy));

    // Distribución de muestras
    const totalSamples = Number(samplesInfo.total_samples) || 0;
    const samplesDistribution = samplesInfo.samples_per_class ?
      Object.entries(samplesInfo.samples_per_class).map(([cls, count]) => {
        const c = Number(count);
        const percentage = totalSamples > 0 ? (c / totalSamples) * 100 : 0;
        return {
          class: cls,
          count: !isNaN(c) ? c : 0,
          percentage: !isNaN(percentage) ? percentage : 0
        };
      }).filter(item => !isNaN(item.count) && !isNaN(item.percentage)) : [];

    // Niveles de confianza
    const confidenceLevels = [
      { 
        range: '90-100%', 
        count: models.filter(m => Number(m.accuracy) >= 0.9).length,
        color: '#10B981'
      },
      { 
        range: '80-89%', 
        count: models.filter(m => Number(m.accuracy) >= 0.8 && Number(m.accuracy) < 0.9).length,
        color: '#3B82F6'
      },
      { 
        range: '70-79%', 
        count: models.filter(m => Number(m.accuracy) >= 0.7 && Number(m.accuracy) < 0.8).length,
        color: '#F59E0B'
      },
      { 
        range: '<70%', 
        count: models.filter(m => Number(m.accuracy) < 0.7).length,
        color: '#EF4444'
      }
    ].filter(level => !isNaN(level.count));

    return {
      accuracyTrend,
      samplesDistribution,
      confidenceLevels
    };
  };

  const chartData = getChartData();

  const renderAccuracyChart = () => {
    if (chartData.accuracyTrend.length === 0) {
      return (
        <div className="chart-container">
          <h4>📈 Evolución de Precisión</h4>
          <div className="no-data">No hay datos de modelos</div>
        </div>
      );
    }

    const maxAccuracy = Math.max(...chartData.accuracyTrend.map(d => d.accuracy), 0);
    const chartHeight = 120;
    const chartWidth = 300;
    const padding = 20;

    return (
      <div className="chart-container">
        <h4>📈 Evolución de Precisión</h4>
        <div className="chart-content">
          <svg width={chartWidth} height={chartHeight} className="chart-svg">
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#475569" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#475569" />
            
            {chartData.accuracyTrend.map((point, index) => {
              const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(chartData.accuracyTrend.length - 1, 1);
              const y = chartHeight - padding - (point.accuracy / Math.max(maxAccuracy, 1)) * (chartHeight - 2 * padding);
              
              if (isNaN(x) || isNaN(y)) return null;
              
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="4" fill="#3B82F6" />
                  <text x={x} y={chartHeight - 5} textAnchor="middle" fontSize="10" fill="#94A3B8">
                    {point.name}
                  </text>
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#3B82F6">
                    {point.accuracy.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="chart-legend">
          {chartData.accuracyTrend.map((point, index) => (
            <div key={index} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#3B82F6' }}></span>
              <span className="legend-label">{point.modelName}</span>
              <span className="legend-value">{!isNaN(point.accuracy) ? point.accuracy.toFixed(1) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSamplesChart = () => {
    if (chartData.samplesDistribution.length === 0) {
      return (
        <div className="chart-container">
          <h4>📊 Distribución de Muestras</h4>
          <div className="no-data">No hay muestras recolectadas</div>
        </div>
      );
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return (
      <div className="chart-container">
        <h4>📊 Distribución de Muestras</h4>
        <div className="samples-chart">
          <div className="samples-bars">
            {chartData.samplesDistribution.map((item, index) => (
              <div key={index} className="sample-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${Math.max(item.percentage * 0.8, 10)}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                ></div>
                <div className="bar-label">
                  <span>{item.class}</span>
                  <span>{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="total-samples">
          Total: {samplesInfo.total_samples || 0} muestras
        </div>
      </div>
    );
  };

  const renderConfidenceChart = () => {
    if (chartData.confidenceLevels.length === 0) {
      return (
        <div className="chart-container">
          <h4>🎯 Niveles de Confianza</h4>
          <div className="no-data">No hay modelos entrenados</div>
        </div>
      );
    }

    const maxCount = Math.max(...chartData.confidenceLevels.map(d => d.count), 0);

    return (
      <div className="chart-container">
        <h4>🎯 Niveles de Confianza</h4>
        <div className="confidence-chart">
          {chartData.confidenceLevels.map((level, index) => (
            <div key={index} className="confidence-level">
              <div className="level-info">
                <span className="level-range">{level.range}</span>
                <span className="level-count">{level.count} modelos</span>
              </div>
              <div className="level-bar">
                <div 
                  className="level-fill"
                  style={{ 
                    width: `${(level.count / Math.max(maxCount, 1)) * 100}%`,
                    backgroundColor: level.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderModelsSummary = () => {
    if (!models || models.length === 0) return null;

    const avgAccuracy = models.reduce((sum, model) => sum + (Number(model.accuracy) || 0), 0) / models.length;
    const totalSamples = models.reduce((sum, model) => sum + (Number(model.n_samples) || 0), 0);

    return (
      <div className="models-summary">
        <div className="summary-item">
          <span className="summary-value">{models.length}</span>
          <span className="summary-label">Modelos</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{!isNaN(avgAccuracy) ? (avgAccuracy * 100).toFixed(1) : 0}%</span>
          <span className="summary-label">Precisión Promedio</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{totalSamples}</span>
          <span className="summary-label">Muestras Totales</span>
        </div>
      </div>
    );
  };

  return (
    <div className="model-charts">
      <div className="charts-header">
        <h3>📈 Análisis de Modelos</h3>
        {renderModelsSummary()}
      </div>
      
      <div className="charts-grid">
        {renderAccuracyChart()}
        {renderSamplesChart()}
        {renderConfidenceChart()}
      </div>

      {models && models.length > 0 && (
        <div className="models-details">
          <h4>Detalles de Modelos</h4>
          <div className="models-list">
            {models.map((model, index) => (
              <div key={index} className="model-detail-card">
                <div className="model-name">{model.name || `Modelo ${index + 1}`}</div>
                <div className="model-stats">
                  <span className="stat">Precisión: <strong>{!isNaN(model.accuracy) ? (model.accuracy * 100).toFixed(2) : 0}%</strong></span>
                  <span className="stat">Muestras: <strong>{model.n_samples || 0}</strong></span>
                  <span className="stat">Clases: <strong>{model.classes?.length || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCharts;
