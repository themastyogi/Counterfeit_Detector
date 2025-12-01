import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const PrintableReport = ({ result, testerName, testDate, remarks }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'LIKELY_GENUINE':
                return { label: 'LIKELY GENUINE', color: '#10b981' };
            case 'SUSPICIOUS':
                return { label: 'SUSPICIOUS', color: '#f59e0b' };
            case 'HIGH_RISK':
                return { label: 'HIGH RISK - COUNTERFEIT', color: '#ef4444' };
            default:
                return { label: status, color: '#64748b' };
        }
    };

    const config = getStatusConfig(result.status);
    const referenceData = result.reference_comparison;

    return (
        <div className="print-report" style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '210mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            color: '#000'
        }}>
            {/* Header */}
            <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                    COUNTERFEIT DETECTION TEST REPORT
                </h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    VeriScan™ Authenticity Verification System
                </p>
            </div>

            {/* Test Information */}
            <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                    Test Information
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', width: '30%' }}>
                                Report ID:
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                {result._id || 'N/A'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                Test Date:
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                {testDate || new Date().toLocaleDateString()}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                Tested By:
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                {testerName || '___________________________'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                Scan Type:
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                {result.scan_type || 'Standard Scan'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Test Result */}
            <div style={{
                marginBottom: '25px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                border: `3px solid ${config.color}`,
                borderRadius: '8px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                    VERDICT
                </h2>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: config.color,
                        marginBottom: '10px'
                    }}>
                        {config.label}
                    </div>
                    <div style={{ fontSize: '18px', color: '#64748b' }}>
                        Risk Score: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{result.risk_score}/100</span>
                    </div>
                </div>
            </div>

            {/* Reference Comparison */}
            {referenceData && (
                <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                        Reference Comparison Analysis
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Scanned Image</p>
                            <div style={{ border: '2px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                                <img src={result.image_path} alt="Scanned" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                        <div>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Reference Image</p>
                            <div style={{ border: '2px solid #10b981', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
                                {referenceData.referenceImage ? (
                                    <img src={referenceData.referenceImage} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                                        No reference image
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Overall Match</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                                {referenceData.overallSimilarity?.toFixed(0) || 0}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Color Match</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                                {referenceData.colorSimilarity?.toFixed(0) || 0}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Logo Match</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                                {referenceData.logoSimilarity?.toFixed(0) || 0}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Findings */}
            {result.flags_json && Object.keys(result.flags_json).length > 0 && (
                <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                        Detailed Findings
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Parameter</th>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Finding</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(result.flags_json).map(([key, value], index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                        {key}
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Remarks */}
            <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                    Testing Remarks & Observations
                </h2>
                <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '15px',
                    minHeight: '100px',
                    backgroundColor: '#f8fafc'
                }}>
                    {remarks || 'No remarks provided.'}
                </div>
            </div>

            {/* Signature Section */}
            <div style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '50px' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Tester Signature</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                                {testerName || 'Name'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '50px' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Authorized By</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                                Quality Control Manager
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '40px',
                paddingTop: '15px',
                borderTop: '2px solid #e2e8f0',
                fontSize: '10px',
                color: '#64748b',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0 }}>
                    This report was generated by VeriScan™ Counterfeit Detection System
                </p>
                <p style={{ margin: '4px 0 0 0' }}>
                    Report generated on: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default PrintableReport;
