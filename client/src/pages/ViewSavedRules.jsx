import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, CheckCircle, XCircle, ArrowLeft, Settings, Trash2, Edit, Code } from 'lucide-react';

const ViewSavedRules = () => {
    const { token, isAdmin, isTenantAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteRule = async (productId, productName) => {
        if (!confirm(`Are you sure you want to delete all rules for "${productName}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ metadata_json: {} })
            });

            if (res.ok) {
                setMessage('✅ Rules deleted successfully!');
                fetchProducts();
            } else {
                setMessage('❌ Failed to delete rules');
            }
        } catch (err) {
            setMessage('❌ Error deleting rules');
            console.error(err);
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter products that have saved rules
    const productsWithRules = products.filter(p =>
        p.metadata_json &&
        p.metadata_json.rules &&
        Object.keys(p.metadata_json.rules).length > 0
    );

    const productsWithoutRules = products.filter(p =>
        !p.metadata_json ||
        !p.metadata_json.rules ||
        Object.keys(p.metadata_json.rules).length === 0
    );

    if (!isAdmin && !isTenantAdmin) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="card p-8 text-center">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Only admins can view saved rules.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-muted">Loading saved rules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/test-rules')}
                    className="btn btn-outline mb-4 flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back to Test Rules
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                            <Database className="w-8 h-8" />
                            Saved Test Rules
                        </h1>
                        <p className="text-text-muted mt-1">View all configured validation rules stored in the database</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-text-muted">Storage Location</div>
                        <div className="text-lg font-bold text-primary">MongoDB Database</div>
                        <div className="text-xs text-text-muted">ProductMaster.metadata_json</div>
                    </div>
                </div>
            </div>

            {/* Message Notification */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-sm text-blue-700 mb-1">Total Products</div>
                    <div className="text-3xl font-bold text-blue-900">{products.length}</div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-sm text-green-700 mb-1">With Rules Configured</div>
                    <div className="text-3xl font-bold text-green-900">{productsWithRules.length}</div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                    <div className="text-sm text-amber-700 mb-1">Without Rules</div>
                    <div className="text-3xl font-bold text-amber-900">{productsWithoutRules.length}</div>
                </div>
            </div>

            {/* Products with Rules */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={24} />
                    Products with Configured Rules ({productsWithRules.length})
                </h2>
                {productsWithRules.length === 0 ? (
                    <div className="card p-8 text-center">
                        <p className="text-text-muted">No products have test rules configured yet.</p>
                        <button
                            onClick={() => navigate('/test-rules')}
                            className="btn btn-primary mt-4"
                        >
                            Configure Rules
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {productsWithRules.map(product => (
                            <div key={product._id} className="card overflow-hidden">
                                <button
                                    onClick={() => setExpandedProduct(expandedProduct === product._id ? null : product._id)}
                                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-primary">{product.product_name}</div>
                                            <div className="text-sm text-text-muted">{product.brand} • {product.category}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="badge bg-green-100 text-green-800">
                                                ✓ Rules Configured
                                            </span>
                                            <span className="text-text-muted">
                                                {expandedProduct === product._id ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {expandedProduct === product._id && (
                                    <div className="border-t border-border p-6 bg-gray-50">
                                        {/* Rule Header with Code and Actions */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <Code className="text-primary" size={20} />
                                                <div>
                                                    <div className="text-sm text-text-muted">Rule Code (for tracing)</div>
                                                    <div className="font-mono text-sm font-bold text-primary">
                                                        RULE-{product._id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        navigate('/test-rules');
                                                        // Could add logic to auto-select this product
                                                    }}
                                                    className="btn btn-sm btn-outline flex items-center gap-2"
                                                >
                                                    <Edit size={16} />
                                                    Edit Rules
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRule(product._id, product.product_name)}
                                                    className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete Rules
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Rules - User Friendly Display */}
                                            <div>
                                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                                    <CheckCircle size={18} className="text-green-600" />
                                                    Validation Rules
                                                </h3>
                                                <div className="space-y-3 bg-white p-4 rounded-lg border border-border">
                                                    {/* Logo Detection */}
                                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm font-medium">Logo Detection</span>
                                                        <span className={`badge ${product.metadata_json.rules.use_logo_check ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                            {product.metadata_json.rules.use_logo_check ? '✓ Enabled' : '✗ Disabled'}
                                                        </span>
                                                    </div>

                                                    {/* Generic Labels */}
                                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm font-medium">Generic Category Labels</span>
                                                        <span className={`badge ${product.metadata_json.rules.use_generic_labels ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                            {product.metadata_json.rules.use_generic_labels ? '✓ Enabled' : '✗ Disabled'}
                                                        </span>
                                                    </div>

                                                    {/* Required Identifiers */}
                                                    {product.metadata_json.rules.required_identifiers && product.metadata_json.rules.required_identifiers.length > 0 && (
                                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                            <div className="text-sm font-medium text-blue-900 mb-2">Required Identifiers</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {product.metadata_json.rules.required_identifiers.map((id, idx) => (
                                                                    <span key={idx} className="badge bg-blue-600 text-white text-xs px-3 py-1">
                                                                        {id.toUpperCase()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="text-xs text-blue-700 mt-2">
                                                                These identifiers must be present in the scanned image
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Identifier Patterns */}
                                                    {product.metadata_json.rules.identifier_patterns && Object.keys(product.metadata_json.rules.identifier_patterns).length > 0 && (
                                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                                            <div className="text-sm font-medium text-purple-900 mb-2">Validation Patterns</div>
                                                            <div className="space-y-1">
                                                                {Object.entries(product.metadata_json.rules.identifier_patterns).map(([key, pattern]) => (
                                                                    <div key={key} className="text-xs">
                                                                        <span className="font-medium text-purple-800">{key}:</span>
                                                                        <code className="ml-2 text-purple-600 bg-white px-2 py-0.5 rounded">{pattern}</code>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Weights - User Friendly Display */}
                                            <div>
                                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                                    <Database size={18} className="text-orange-600" />
                                                    Risk Weights
                                                </h3>
                                                <div className="space-y-2 bg-white p-4 rounded-lg border border-border max-h-96 overflow-y-auto">
                                                    {product.metadata_json.weights && Object.keys(product.metadata_json.weights).length > 0 ? (
                                                        Object.entries(product.metadata_json.weights)
                                                            .sort(([, a], [, b]) => b - a) // Sort by weight descending
                                                            .map(([key, value]) => {
                                                                const severity = value >= 50 ? 'high' : value >= 30 ? 'medium' : 'low';
                                                                const colorClass = severity === 'high' ? 'text-red-600 bg-red-50' :
                                                                    severity === 'medium' ? 'text-orange-600 bg-orange-50' :
                                                                        'text-yellow-600 bg-yellow-50';
                                                                return (
                                                                    <div key={key} className={`flex justify-between items-center p-2 rounded ${colorClass}`}>
                                                                        <span className="text-sm font-medium capitalize">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                                <div
                                                                                    className={`h-2 rounded-full ${severity === 'high' ? 'bg-red-600' : severity === 'medium' ? 'bg-orange-600' : 'bg-yellow-600'}`}
                                                                                    style={{ width: `${value}%` }}
                                                                                ></div>
                                                                            </div>
                                                                            <span className="font-bold text-sm w-8 text-right">{value}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                    ) : (
                                                        <div className="text-sm text-text-muted text-center py-4">No weights configured</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Advanced: Raw JSON (Collapsed by default) */}
                                        <details className="mt-6">
                                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-primary flex items-center gap-2">
                                                <Code size={16} />
                                                View Technical Details (Raw JSON)
                                            </summary>
                                            <pre className="mt-3 p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto border border-gray-700">
                                                {JSON.stringify(product.metadata_json, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Products without Rules */}
            {productsWithoutRules.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-text-muted mb-4 flex items-center gap-2">
                        <XCircle className="text-gray-400" size={24} />
                        Products without Rules ({productsWithoutRules.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productsWithoutRules.map(product => (
                            <div key={product._id} className="card p-4 bg-gray-50">
                                <div className="font-semibold text-sm">{product.product_name}</div>
                                <div className="text-xs text-text-muted">{product.brand} • {product.category}</div>
                                <button
                                    onClick={() => navigate('/test-rules')}
                                    className="btn btn-sm btn-outline mt-2 w-full"
                                >
                                    Configure Rules
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewSavedRules;
