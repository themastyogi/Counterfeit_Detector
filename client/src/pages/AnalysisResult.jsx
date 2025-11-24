import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, Download, ArrowLeft } from 'lucide-react';

const AnalysisResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch analysis by ID
        // For now, using mock data
        setTimeout(() => {
            setAnalysis({
                _id: id,
                filename: '500-rupee-note.jpg',
                createdAt: new Date(),
                analysis: {
                    authentic: true,
                    confidence: 0.92,
                    status: 'authentic',
                    details: {
                        labels: [
                            { description: 'Currency', score: 0.95 },
                            { description: 'Paper', score: 0.89 },
                            { description: 'Document', score: 0.82 }
                        ],
                        textDetected: 'RESERVE BANK OF INDIA\n500\nFIVE HUNDRED RUPEES',
                        dominantColors: ['#1a5f3c', '#e8e8e8', '#2d2d2d'],
                        spoofDetection: 'VERY_UNLIKELY'
                    }
                },
                recommendations: ['Item appears authentic', 'No suspicious patterns detected']
            });
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    }

    if (!analysis) {
        return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Analysis not found</div>;
    }

    const getStatusIcon = () => {
        if (analysis.analysis.status === 'authentic') return <CheckCircle size={48} />;
        if (analysis.analysis.status === 'suspicious') return <AlertTriangle size={48} />;
        return <XCircle size={48} />;
    };

    const getStatusColor = () => {
        if (analysis.analysis.status === 'authentic') return 'var(--color-success)';
        if (analysis.analysis.status === 'suspicious') return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <div className="analysis-result-page">
            <div className="container">
                <button className="btn btn-outline mb-1" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="result-header">
                    <div className="status-icon" style={{ color: getStatusColor() }}>
                        {getStatusIcon()}
                    </div>
                    <h1>{analysis.analysis.status.toUpperCase()}</h1>
                    <p className="filename">{analysis.filename}</p>
                </div>

                <div className="result-grid">
                    <div className="card confidence-card">
                        <h3>Confidence Score</h3>
                        <div className="confidence-meter">
                            <div className="confidence-bar" style={{ width: `${analysis.analysis.confidence * 100}%` }}></div>
                        </div>
                        <p className="confidence-value">{(analysis.analysis.confidence * 100).toFixed(0)}%</p>
                    </div>

                    <div className="card labels-card">
                        <h3>Detected Labels</h3>
                        <div className="labels-list">
                            {analysis.analysis.details.labels.map((label, idx) => (
                                <div key={idx} className="label-item">
                                    <span>{label.description}</span>
                                    <span className="label-score">{(label.score * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card text-card">
                        <h3>Detected Text</h3>
                        <pre className="detected-text">{analysis.analysis.details.textDetected}</pre>
                    </div>

                    <div className="card colors-card">
                        <h3>Dominant Colors</h3>
                        <div className="color-palette">
                            {analysis.analysis.details.dominantColors.map((color, idx) => (
                                <div key={idx} className="color-swatch" style={{ backgroundColor: color }}>
                                    <span className="color-code">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card recommendations-card">
                        <h3>Recommendations</h3>
                        <ul className="recommendations-list">
                            {analysis.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="result-actions">
                    <button className="btn btn-primary">
                        <Download size={18} /> Export Report
                    </button>
                </div>
            </div>

            <style>{`
        .analysis-result-page {
          padding: var(--spacing-xl) 0;
          background-color: var(--color-background);
          min-height: calc(100vh - 70px);
        }

        .result-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .status-icon {
          margin: 0 auto var(--spacing-md);
        }

        .result-header h1 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-xs);
        }

        .filename {
          color: var(--color-text-muted);
          font-size: 1.1rem;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .confidence-card {
          grid-column: span 2;
        }

        .confidence-meter {
          width: 100%;
          height: 40px;
          background-color: var(--color-background);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin: var(--spacing-md) 0;
        }

        .confidence-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-success), var(--color-accent));
          transition: width 1s ease;
        }

        .confidence-value {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-accent);
        }

        .labels-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .label-item {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-sm);
          background-color: var(--color-background);
          border-radius: var(--radius-sm);
        }

        .label-score {
          font-weight: 600;
          color: var(--color-accent);
        }

        .detected-text {
          background-color: var(--color-background);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          white-space: pre-wrap;
          font-family: monospace;
        }

        .color-palette {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .color-swatch {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: var(--spacing-xs);
          box-shadow: var(--shadow-md);
        }

        .color-code {
          font-size: 0.75rem;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-family: monospace;
        }

        .recommendations-list {
          list-style: none;
          padding: 0;
        }

        .recommendations-list li {
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          background-color: var(--color-background);
          border-left: 3px solid var(--color-accent);
          border-radius: var(--radius-sm);
        }

        .result-actions {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
        }

        @media (max-width: 768px) {
          .confidence-card {
            grid-column: span 1;
          }
        }
      `}</style>
        </div>
    );
};

export default AnalysisResult;
