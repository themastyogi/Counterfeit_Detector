import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, ChevronDown, Download } from 'lucide-react';

const ScanHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/scan/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'LIKELY_GENUINE':
                return <span className="badge badge-success">Genuine</span>;
            case 'SUSPICIOUS':
                return <span className="badge badge-warning">Suspicious</span>;
            case 'HIGH_RISK':
                return <span className="badge badge-danger">High Risk</span>;
            default:
                return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Scan History</h2>
                    <p className="text-text-muted">View and manage past verification results</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="btn btn-outline flex items-center gap-2 flex-1 sm:flex-none justify-center">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                {/* Mobile View (Cards) */}
                <div className="block sm:hidden">
                    {loading ? (
                        <div className="p-8 text-center text-text-muted">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-text-muted">No scan history found</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {history.map(item => (
                                <div key={item._id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-primary">{item.product_id?.product_name || 'Unknown Product'}</div>
                                            <div className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleString()}</div>
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-text-muted">{item.scan_type}</span>
                                        <span className="font-semibold text-primary">Score: {item.risk_score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date / Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Scan Mode</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Result</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-text-muted">Loading history...</td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-text-muted">No scan history found</td></tr>
                            ) : (
                                history.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                            {item.product_id?.product_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {item.scan_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                            {item.risk_score}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-accent hover:text-accent-hover">View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScanHistory;
