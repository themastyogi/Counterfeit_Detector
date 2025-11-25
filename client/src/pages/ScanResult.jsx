import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, RefreshCw, Share2, Download, Shield } from 'lucide-react';

const ScanResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">No Result Found</h3>
                <p className="text-text-muted mb-6">Please start a new scan to see results.</p>
                <button onClick={() => navigate('/quick-scan')} className="btn btn-primary">
                    Go to Quick Scan
                </button>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'LIKELY_GENUINE':
                return { color: 'text-success', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Likely Genuine' };
            case 'SUSPICIOUS':
                return { color: 'text-warning', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, label: 'Suspicious' };
            case 'HIGH_RISK':
                return { color: 'text-danger', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'High Risk' };
            default:
                return { color: 'text-text-muted', bg: 'bg-gray-50', border: 'border-gray-200', icon: Shield, label: status };
        }
    };

    const config = getStatusConfig(result.status);
    const StatusIcon = config.icon;

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate('/quick-scan')} className="flex items-center text-text-muted hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Scanner
            </button>

            <div className="card overflow-hidden">
                {/* Header Status */}
                <div className={`text-center py-12 ${config.bg} border-b ${config.border}`}>
                    <div className={`inline-flex p-4 rounded-full bg-white shadow-sm mb-6 ${config.color}`}>
                        <StatusIcon size={64} />
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${config.color}`}>{config.label}</h1>
                    <div className="flex items-center justify-center gap-2 text-text-muted">
                        <span>Risk Score:</span>
                        <span className="font-bold text-primary text-lg">{result.risk_score}/100</span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Scan Details</h3>
                                <div className="bg-background rounded-lg p-4 space-y-3 border border-border">
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Scan ID</span>
                                        <span className="font-mono text-sm text-primary">{result._id?.substring(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Date</span>
                                        <span className="font-medium text-primary">{new Date(result.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Time</span>
                                        <span className="font-medium text-primary">{new Date(result.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Mode</span>
                                        <span className="badge bg-blue-100 text-blue-800">{result.scan_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Analysis Summary</h3>
                                <div className="bg-background rounded-lg p-4 border border-border h-full">
                                    <p className="text-text-main leading-relaxed">
                                        The AI analysis detected {result.status === 'LIKELY_GENUINE' ? 'no significant anomalies' : 'potential irregularities'} in the scanned image.
                                        The confidence score indicates a {result.risk_score < 20 ? 'high' : 'low'} probability of authenticity based on the trained model parameters.
                                    </p>
                                </div>
                            </div>

                            {/* Failure Details */}
                            {result.flags_json && Object.keys(result.flags_json).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Failure Details</h3>
                                    <div className="bg-background rounded-lg p-4 border border-border">
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries(result.flags_json).map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-medium">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                        <button className="flex-1 btn btn-primary flex items-center justify-center gap-2" onClick={() => navigate('/quick-scan')}>
                            <RefreshCw size={18} />
                            Scan Another Item
                        </button>
                        <button className="flex-1 btn btn-outline flex items-center justify-center gap-2" onClick={() => navigate('/history')}>
                            <Shield size={18} />
                            View History
                        </button>
                        <div className="flex gap-2">
                            <button className="btn btn-outline px-4" title="Download Report">
                                <Download size={18} />
                            </button>
                            <button className="btn btn-outline px-4" title="Share Result">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScanResult;
