import React, { useState, useEffect } from 'react';
import UploadZone from '../components/UploadZone';
import { Clock, AlertTriangle, CheckCircle, Upload, Crown, Cloud, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // File and Analysis State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  // Test Configuration State
  const [configComplete, setConfigComplete] = useState(false);
  const [testConfig, setTestConfig] = useState({
    testName: '',
    categoryId: '',
    testMethod: 'cloud'
  });
  const [categories, setCategories] = useState([]);

  // Activity and Stats
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState({ monthlyScans: 0, totalScans: 0, monthlyLimit: 50 });

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
    fetchUserStats();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/test-categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data.stats);
          return;
        }
      }

      const historyResponse = await fetch('/api/history');
      const historyData = await historyResponse.json();

      if (historyData.success && historyData.history) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyScans = historyData.history.filter(item =>
          new Date(item.createdAt) >= startOfMonth
        ).length;

        setUserStats({
          monthlyScans,
          totalScans: historyData.history.length,
          monthlyLimit: 50
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (response.ok && data.success) {
        setRecentActivity(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleFileSelect = (file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    // Add test configuration data
    formData.append('testName', testConfig.testName);
    formData.append('testCategory', testConfig.categoryId);
    formData.append('testMethod', testConfig.testMethod);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysisResult(data.result);
        const source = data.result?.analysis?.details?.dataSource || data.dataSource || 'CLOUD_VISION_API';
        setDataSource(source);
        fetchRecentActivity();
        fetchUserStats();
      } else {
        alert(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDataSourceBadge = () => {
    if (!dataSource) return null;
    const isCloudAPI = dataSource === 'CLOUD_VISION_API';
    return (
      <div className={`data-source-badge ${isCloudAPI ? 'cloud' : 'mock'}`}>
        {isCloudAPI ? <Cloud size={20} /> : <Database size={20} />}
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {isCloudAPI ? '🔵 Google Cloud Vision API' : '🟡 Mock Data (Fallback)'}
        </span>
      </div>
    );
  };

  const getStatusIcon = () => {
    if (!analysisResult) return null;
    if (analysisResult.analysis.status === 'authentic') {
      return <CheckCircle size={48} style={{ color: 'var(--color-success)' }} />;
    }
    return <AlertTriangle size={48} style={{ color: 'var(--color-warning)' }} />;
  };

  const handleConfigSubmit = () => {
    if (!testConfig.testName || !testConfig.categoryId) {
      alert('Please fill in all required fields');
      return;
    }
    setConfigComplete(true);
  };

  const handleResetConfig = () => {
    setConfigComplete(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setDataSource(null);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Upload items for authenticity verification</p>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button className="btn btn-accent admin-btn" onClick={() => navigate('/admin')}>
                <Crown size={18} />
                Admin Panel
              </button>
            )}
            <span className="plan-badge">{user?.role === 'admin' ? 'Admin' : 'Premium Plan'}</span>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="main-content">
            {/* Test Configuration Form */}
            {!configComplete && (
              <div className="card config-card">
                <h2>Configure Test</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                  Set up your test parameters before uploading an image
                </p>

                <div className="config-form">
                  <div className="form-group">
                    <label htmlFor="testName">Test Name *</label>
                    <input
                      id="testName"
                      type="text"
                      className="form-input"
                      value={testConfig.testName}
                      onChange={(e) => setTestConfig({ ...testConfig, testName: e.target.value })}
                      placeholder="e.g., 500 Rupee Note Verification"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Test Category *</label>
                    <select
                      id="category"
                      className="form-input"
                      value={testConfig.categoryId}
                      onChange={(e) => setTestConfig({ ...testConfig, categoryId: e.target.value })}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Test Method *</label>
                    <div className="method-options">
                      <div
                        className={`method-card ${testConfig.testMethod === 'local' ? 'selected' : ''}`}
                        onClick={() => setTestConfig({ ...testConfig, testMethod: 'local' })}
                      >
                        <Database size={24} />
                        <h4>Local Master Data</h4>
                        <p>Free - Uses admin-defined criteria</p>
                        <span className="badge badge-success">FREE</span>
                      </div>
                      <div
                        className={`method-card ${testConfig.testMethod === 'cloud' ? 'selected' : ''}`}
                        onClick={() => setTestConfig({ ...testConfig, testMethod: 'cloud' })}
                      >
                        <Cloud size={24} />
                        <h4>VeriScan Cloud API</h4>
                        <p>Chargeable - Advanced AI analysis</p>
                        <span className="badge badge-primary">PREMIUM</span>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-lg w-full" onClick={handleConfigSubmit}>
                    Continue to Upload
                  </button>
                </div>
              </div>
            )}

            {/* Upload and Analysis Section */}
            {configComplete && (
              <div className="card upload-card">
                {/* Test Summary */}
                <div className="test-summary">
                  <h3>Test Configuration</h3>
                  <div className="summary-grid">
                    <div><strong>Test Name:</strong> {testConfig.testName}</div>
                    <div><strong>Category:</strong> {categories.find(c => c._id === testConfig.categoryId)?.name}</div>
                    <div><strong>Method:</strong> {testConfig.testMethod === 'local' ? 'Local Master Data (Free)' : 'VeriScan Cloud API (Premium)'}</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={handleResetConfig}>
                    Change Configuration
                  </button>
                </div>

                <UploadZone onFileSelect={handleFileSelect} />

                {selectedFile && !analysisResult && (
                  <div className="action-bar">
                    <button
                      className="btn btn-primary btn-lg w-full"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock size={18} className="spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Run Test
                        </>
                      )}
                    </button>
                  </div>
                )}

                {analysisResult && (
                  <div className="result-card">
                    {getDataSourceBadge()}

                    <div className="result-header">
                      {getStatusIcon()}
                      <h2 style={{
                        color: analysisResult.analysis.status === 'authentic'
                          ? 'var(--color-success)'
                          : 'var(--color-warning)'
                      }}>
                        {analysisResult.analysis.status.toUpperCase()}
                      </h2>
                      <p className="confidence-text">
                        Confidence: <strong>{(analysisResult.analysis.confidence * 100).toFixed(0)}%</strong>
                      </p>
                    </div>

                    <div className="result-body">
                      <h4>Recommendations:</h4>
                      <ul className="recommendations">
                        {analysisResult.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <button className="btn btn-outline w-full" onClick={handleResetConfig}>
                      Run Another Test
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="sidebar">
            <div className="card recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((item, idx) => (
                    <div key={item._id || idx} className="activity-item">
                      <div className={`activity-icon ${item.analysis?.status === 'authentic' ? 'success' : 'warning'}`}>
                        {item.analysis?.status === 'authentic' ? (
                          <CheckCircle size={18} />
                        ) : (
                          <AlertTriangle size={18} />
                        )}
                      </div>
                      <div className="activity-details">
                        <h4>{item.filename || 'Unknown'}</h4>
                        <span className="timestamp">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className={`status-badge ${item.analysis?.status === 'authentic' ? 'success' : 'warning'}`}>
                        {item.analysis?.status === 'authentic' ? 'Authentic' : 'Suspicious'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--spacing-lg)' }}>
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            <div className="card stats-card mt-1">
              <h3>Monthly Usage</h3>
              <div className="stat-row">
                <span>Scans Used</span>
                <span className="stat-value">{userStats.monthlyScans} / {userStats.monthlyLimit}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(userStats.monthlyScans / userStats.monthlyLimit) * 100}%` }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                Total scans: {userStats.totalScans}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          padding: var(--spacing-xl) 0;
          background-color: var(--color-background);
          min-height: calc(100vh - 70px);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: var(--spacing-xs);
        }

        .dashboard-header p {
          color: var(--color-text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .admin-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .plan-badge {
          padding: 6px 16px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: var(--spacing-xl);
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Test Configuration Styles */
        .config-card {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .config-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
          color: var(--color-text-main);
        }

        .form-input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background-color: var(--color-surface);
          color: var(--color-text-main);
          transition: border-color var(--transition-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .method-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .method-card {
          padding: var(--spacing-lg);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          background-color: var(--color-surface);
        }

        .method-card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .method-card.selected {
          border-color: var(--color-accent);
          background-color: rgba(59, 130, 246, 0.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .method-card h4 {
          margin: var(--spacing-sm) 0;
          font-size: 1rem;
        }

        .method-card p {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-sm);
        }

        .test-summary {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .test-summary h3 {
          margin-bottom: var(--spacing-md);
          font-size: 1.125rem;
        }

        .summary-grid {
          display: grid;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .summary-grid div {
          padding: var(--spacing-xs);
          background-color: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .data-source-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 16px 24px;
          border-radius: var(--radius-full);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--spacing-lg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .data-source-badge.cloud {
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: white;
          border: 2px solid #2563eb;
        }

        .data-source-badge.mock {
          background-color: #fef3c7;
          color: #92400e;
          border: 2px solid #f59e0b;
        }

        .result-card {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-xl);
          background-color: var(--color-background);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .result-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .result-header h2 {
          margin: var(--spacing-md) 0;
          font-size: 1.75rem;
        }

        .confidence-text {
          color: var(--color-text-muted);
          font-size: 1rem;
        }

        .result-body h4 {
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-main);
        }

        .recommendations {
          list-style: none;
          padding: 0;
        }

        .recommendations li {
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
          background-color: var(--color-surface);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-accent);
        }

        .action-bar {
          margin-top: var(--spacing-lg);
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .recent-activity h3 {
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-border);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background-color: var(--color-background);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon.success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .activity-icon.warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }

        .activity-details {
          flex: 1;
          min-width: 0;
        }

        .activity-details h4 {
          font-size: 0.875rem;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timestamp {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .status-badge.success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .status-badge.warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }

        .stats-card h3 {
          margin-bottom: var(--spacing-md);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .stat-value {
          font-weight: 700;
          color: var(--color-accent);
        }

        .progress-bar {
          height: 8px;
          background-color: var(--color-background);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
          transition: width 0.3s ease;
        }

        .mt-1 {
          margin-top: var(--spacing-lg);
        }

        .w-full {
          width: 100%;
        }

        .badge {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .badge-primary {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--color-accent);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
