import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, CheckCircle, XCircle, ArrowLeft, Settings } from 'lucide-react';

const ViewSavedRules = () => {
    const { token, isAdmin, isTenantAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProduct, setExpandedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Rules */}
                                            <div>
                                                <h3 className="font-bold text-primary mb-3">Validation Rules</h3>
                                                <div className="space-y-2 bg-white p-4 rounded-lg border border-border">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-text-muted">Logo Detection:</span>
                                                        <span className="font-medium">{product.metadata_json.rules.use_logo_check ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-text-muted">Generic Labels:</span>
                                                        <span className="font-medium">{product.metadata_json.rules.use_generic_labels ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                    {product.metadata_json.rules.required_identifiers && (
                                                        <div className="text-sm pt-2 border-t">
                                                            <span className="text-text-muted">Required Identifiers:</span>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {product.metadata_json.rules.required_identifiers.map((id, idx) => (
                                                                    <span key={idx} className="badge bg-blue-100 text-blue-800 text-xs">
                                                                        {id}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Weights */}
                                            <div>
                                                <h3 className="font-bold text-primary mb-3">Violation Weights</h3>
                                                <div className="space-y-2 bg-white p-4 rounded-lg border border-border max-h-48 overflow-y-auto">
                                                    {product.metadata_json.weights && Object.keys(product.metadata_json.weights).length > 0 ? (
                                                        Object.entries(product.metadata_json.weights).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between text-sm">
                                                                <span className="text-text-muted">{key.replace(/_/g, ' ')}:</span>
                                                                <span className="font-medium text-primary">{value}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-text-muted">No weights configured</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Raw JSON */}
                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-sm font-medium text-primary hover:text-blue-700">
                                                View Raw JSON
                                            </summary>
                                            <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
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
