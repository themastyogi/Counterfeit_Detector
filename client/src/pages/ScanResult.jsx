import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, RefreshCw, Share2, Download, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import PrintableReport from '../components/PrintableReport';

const ScanResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasFeature } = useAuth();
    const result = location.state?.result;

    // State for test report
    const [remarks, setRemarks] = React.useState('');
    const [testerName, setTesterName] = React.useState('');
    const [testDate, setTestDate] = React.useState(new Date().toISOString().split('T')[0]);

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

    // Check if reference comparison is available and allowed
    const showComparison = result.reference_comparison && hasFeature('reference_comparison');
    const referenceData = result.reference_comparison;

    // Print function
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Screen View - Hidden when printing */}
            <div className="max-w-4xl mx-auto p-4 print:hidden">
                <button onClick={() => navigate('/quick-scan')} className="flex items-center text-text-muted hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Scanner
                </button>

                <div className="card overflow-hidden mb-8">
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

                    {/* Reference Comparison Section (Premium) */}
                    {showComparison && (
                        <div className="border-b border-border p-6 bg-blue-50/30">
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-blue-600" />
                                Reference Comparison Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Scanned Image */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-text-muted text-center">Scanned Image</div>
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-border shadow-sm">
                                        <img src={result.image_url || '/placeholder-image.jpg'} alt="Scanned" className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-text-muted text-center">Reference: {referenceData.referenceName || 'Official Product'}</div>

                                    {/* DEBUG INFO */}
                                    <div className="text-xs text-red-500 break-all">
                                        DEBUG: {JSON.stringify(referenceData)}
                                    </div>

                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-border shadow-sm relative">
                                        {referenceData.referenceImage ? (
                                            <img src={referenceData.referenceImage.replace(/\\/g, '/')} alt="Reference" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-text-muted">Image not available</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            VERIFIED
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Similarity Metrics */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="bg-white p-3 rounded-lg border border-border text-center">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Overall Match</div>
                                    <div className={`text-xl font-bold ${(referenceData.similarity * 100) > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {(referenceData.similarity * 100)?.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-border text-center">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Confidence</div>
                                    <div className="text-xl font-bold text-primary">{referenceData.confidence}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-border text-center">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Logo Match</div>
                                    <div className="text-xl font-bold text-primary">
                                        {referenceData.details?.logoMatched ? 'Yes' : 'No'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feature Upsell (If feature disabled but data exists) */}
                    {result.reference_comparison && !hasFeature('reference_comparison') && (
                        <div className="p-6 bg-gray-50 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-200 p-3 rounded-full">
                                    <Lock size={24} className="text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Premium Feature Locked</h4>
                                    <p className="text-sm text-gray-600">Upgrade to view detailed reference comparison and side-by-side analysis.</p>
                                </div>
                            </div>
                            <button className="btn btn-primary text-sm">Upgrade Plan</button>
                        </div>
                    )}

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

                        {/* Test Report Section */}
                        <div className="border-t border-border p-6 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-primary mb-4">Test Report & Notes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">
                                        Tester Name
                                    </label>
                                    <input
                                        type="text"
                                        value={testerName}
                                        onChange={(e) => setTesterName(e.target.value)}
                                        className="input-field"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">
                                        Test Date
                                    </label>
                                    <input
                                        type="date"
                                        value={testDate}
                                        onChange={(e) => setTestDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Testing Remarks & Observations
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    placeholder="Enter your observations, testing notes, or any additional remarks about this scan..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                            <button className="flex-1 btn btn-primary flex items-center justify-center gap-2" onClick={handlePrint}>
                                <Download size={18} />
                                Print Report
                            </button>
                            <button className="flex-1 btn btn-primary flex items-center justify-center gap-2" onClick={() => navigate('/quick-scan')}>
                                <RefreshCw size={18} />
                                Scan Another Item
                            </button>
                            <button className="flex-1 btn btn-outline flex items-center justify-center gap-2" onClick={() => navigate('/history')}>
                                <Shield size={18} />
                                View History
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable Report - Visible ONLY when printing */}
            <div className="hidden print:block">
                <PrintableReport
                    result={result}
                    testerName={testerName}
                    testDate={testDate}
                    remarks={remarks}
                />
            </div>
        </>
    );
};

export default ScanResult;
