import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, RotateCcw, Plus, Trash2, Copy, BookOpen, Smartphone, Droplet, Package } from 'lucide-react';

const TestRulesManagement = () => {
    const { token, isAdmin, isTenantAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rules, setRules] = useState({
        use_logo_check: false,
        use_generic_labels: false,
        required_identifiers: [],
        identifier_patterns: {}
    });
    const [weights, setWeights] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Variant Creation State
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [variantData, setVariantData] = useState({ name: '', sku: '' });

    const handleOpenVariantModal = () => {
        if (!selectedProduct) {
            setMessage('Please select a product first to create a variant');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        const product = products.find(p => p._id === selectedProduct);
        setVariantData({
            name: `${product.product_name} - Variant`,
            sku: `${product.sku}-VAR-1`
        });
        setShowVariantModal(true);
    };

    const handleCreateVariant = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const parentProduct = products.find(p => p._id === selectedProduct);

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...parentProduct,
                    _id: undefined, // Remove ID to create new
                    createdAt: undefined,
                    updatedAt: undefined,
                    product_name: variantData.name,
                    sku: variantData.sku,
                    metadata_json: {} // Start with empty rules
                })
            });

            if (res.ok) {
                const newProduct = await res.json();
                setMessage('✅ Variant created successfully!');
                setShowVariantModal(false);
                await fetchProducts(); // Refresh list
                setSelectedProduct(newProduct._id); // Select new variant
            } else {
                const err = await res.json();
                setMessage(`❌ Failed: ${err.message}`);
            }
        } catch (error) {
            setMessage('❌ Error creating variant');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Template library
    const templates = {
        BOOK: {
            name: 'Book Template',
            icon: BookOpen,
            rules: {
                use_logo_check: false,
                use_generic_labels: false,
                required_identifiers: ['isbn', 'publisher'],
                identifier_patterns: {
                    isbn: '^(97[89])?\\d{9}(\\d|X)$'
                }
            },
            weights: {
                invalid_isbn: 50,
                missing_isbn: 40,
                publisher_mismatch: 30,
                low_similarity: 40,
                brand_mismatch: 20,
                category_mismatch: 20
            }
        },
        MOBILE: {
            name: 'Mobile/Smartphone Template',
            icon: Smartphone,
            rules: {
                use_logo_check: true,
                use_generic_labels: true,
                required_identifiers: ['imei', 'brand'],
                identifier_patterns: {
                    imei: '^\\d{15}$'
                }
            },
            weights: {
                brand_mismatch: 60,
                logo_missing: 40,
                invalid_imei: 50,
                missing_imei: 45,
                low_similarity: 50,
                category_mismatch: 30
            }
        },
        COSMETICS: {
            name: 'Cosmetics Template',
            icon: Droplet,
            rules: {
                use_logo_check: true,
                use_generic_labels: true,
                required_identifiers: ['brand', 'batch_number'],
                identifier_patterns: {
                    batch_number: '^[A-Z0-9]{6,12}$'
                }
            },
            weights: {
                brand_mismatch: 50,
                logo_missing: 35,
                missing_batch_number: 40,
                invalid_batch_number: 35,
                low_similarity: 45,
                category_mismatch: 25
            }
        },
        FOOD: {
            name: 'Food/Beverage Template',
            icon: Package,
            rules: {
                use_logo_check: true,
                use_generic_labels: true,
                required_identifiers: ['brand', 'batch_number'],
                identifier_patterns: {
                    batch_number: '^[A-Z0-9]{6,15}$'
                }
            },
            weights: {
                brand_mismatch: 55,
                logo_missing: 40,
                missing_batch_number: 45,
                invalid_batch_number: 40,
                low_similarity: 50,
                category_mismatch: 30
            }
        }
    };

    useEffect(() => {
        if (isAdmin || isTenantAdmin) {
            fetchProducts();
        }
    }, [isAdmin, isTenantAdmin, token]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        const metadata = product.metadata_json || {};
        setRules(metadata.rules || {
            use_logo_check: false,
            use_generic_labels: false,
            required_identifiers: [],
            identifier_patterns: {}
        });
        setWeights(metadata.weights || {});
    };

    const applyTemplate = (templateKey) => {
        const template = templates[templateKey];
        setRules(template.rules);
        setWeights(template.weights);
        setMessage(`Applied ${template.name}`);
        setTimeout(() => setMessage(''), 3000);
    };

    const addIdentifier = () => {
        const name = prompt('Enter identifier name (e.g., isbn, imei, batch_number):');
        if (name && !rules.required_identifiers.includes(name)) {
            setRules({
                ...rules,
                required_identifiers: [...rules.required_identifiers, name]
            });
        }
    };

    const removeIdentifier = (identifier) => {
        setRules({
            ...rules,
            required_identifiers: rules.required_identifiers.filter(i => i !== identifier)
        });
        const newPatterns = { ...rules.identifier_patterns };
        delete newPatterns[identifier];
        setRules({ ...rules, identifier_patterns: newPatterns });
    };

    const updatePattern = (identifier, pattern) => {
        setRules({
            ...rules,
            identifier_patterns: {
                ...rules.identifier_patterns,
                [identifier]: pattern
            }
        });
    };

    const updateWeight = (key, value) => {
        setWeights({
            ...weights,
            [key]: parseInt(value) || 0
        });
    };

    const saveRules = async () => {
        if (!selectedProduct) return;

        setLoading(true);
        try {
            const metadata_json = {
                category: selectedProduct.category || 'OTHER',
                rules,
                weights
            };

            const res = await fetch(`/api/products/${selectedProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ metadata_json })
            });

            if (res.ok) {
                setMessage('✅ Rules saved successfully!');
                fetchProducts(); // Refresh
            } else {
                setMessage('❌ Failed to save rules');
            }
        } catch (err) {
            setMessage('❌ Error saving rules');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (!isAdmin && !isTenantAdmin) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="card p-8 text-center">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Only admins and tenant admins can manage test rules.</p>
                </div>
            </div>
        );
    }

    // Check if user has edit permission (admin or tenant_admin)
    const canEdit = isAdmin || isTenantAdmin;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Test Rules Management</h1>
                <p className="text-text-muted mb-4">Configure validation rules and weights for each product category</p>

                {/* Quick Start Guide */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Quick Start:</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Select a product from the left panel</li>
                        <li>Click a template (Book, Mobile, etc.) to apply pre-configured rules</li>
                        <li>Customize rules and weights as needed</li>
                        <li>Click "Save Rules" to apply</li>
                    </ol>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selector */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-primary mb-4">Select Product</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {products.map(product => {
                            const hasRules = product.metadata_json &&
                                product.metadata_json.rules &&
                                Object.keys(product.metadata_json.rules).length > 0;

                            return (
                                <button
                                    key={product._id}
                                    onClick={() => handleProductSelect(product)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedProduct?._id === product._id
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{product.product_name}</div>
                                            <div className="text-xs text-text-muted">{product.brand} • {product.category}</div>
                                        </div>
                                        {hasRules && (
                                            <div className="ml-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Rules
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rule Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Template Library */}
                    <div className="card p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-primary mb-2">Template Library</h2>
                            <p className="text-sm text-text-muted">
                                {selectedProduct
                                    ? "Click a template below to apply pre-configured rules for that category"
                                    : "Select a product first to apply templates"}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(templates).map(([key, template]) => {
                                const Icon = template.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => applyTemplate(key)}
                                        disabled={!selectedProduct}
                                        className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${selectedProduct
                                            ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:shadow-lg cursor-pointer'
                                            : 'bg-gray-100 cursor-not-allowed opacity-50'
                                            }`}
                                        title={selectedProduct ? `Apply ${template.name}` : 'Select a product first'}
                                    >
                                        <Icon className={`w-8 h-8 ${selectedProduct ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <span className="text-xs font-medium text-center">{template.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedProduct && (
                        <>
                            {/* General Settings */}
                            <div className="card p-6">
                                <h2 className="text-lg font-bold text-primary mb-4">General Settings</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rules.use_logo_check || false}
                                            onChange={(e) => setRules({ ...rules, use_logo_check: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <span className="font-medium">Enable Logo Detection</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rules.use_generic_labels || false}
                                            onChange={(e) => setRules({ ...rules, use_generic_labels: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <span className="font-medium">Use Generic Category Labels</span>
                                    </label>
                                </div>
                            </div>

                            {/* Required Identifiers */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-primary">Required Identifiers</h2>
                                    <button onClick={addIdentifier} className="btn btn-primary btn-sm flex items-center gap-2">
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {rules.required_identifiers?.map(identifier => (
                                        <div key={identifier} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-sm">{identifier}</span>
                                                <button
                                                    onClick={() => removeIdentifier(identifier)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Regex pattern (optional)"
                                                value={rules.identifier_patterns?.[identifier] || ''}
                                                onChange={(e) => updatePattern(identifier, e.target.value)}
                                                className="input-field text-sm font-mono"
                                            />
                                        </div>
                                    ))}
                                    {(!rules.required_identifiers || rules.required_identifiers.length === 0) && (
                                        <p className="text-text-muted text-sm text-center py-4">No identifiers defined. Click "Add" to create one.</p>
                                    )}
                                </div>
                            </div>

                            {/* Violation Weights */}
                            <div className="card p-6">
                                <h2 className="text-lg font-bold text-primary mb-4">Violation Weights (0-100)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'brand_mismatch',
                                        'category_mismatch',
                                        'logo_missing',
                                        'low_similarity',
                                        'medium_similarity',
                                        ...rules.required_identifiers?.map(id => `missing_${id}`) || [],
                                        ...rules.required_identifiers?.map(id => `invalid_${id}`) || []
                                    ].map(key => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-text-main mb-1">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={weights[key] || 0}
                                                onChange={(e) => updateWeight(key, e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={saveRules}
                                    disabled={loading || !canEdit}
                                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                    title={!canEdit ? "You don't have permission to edit rules" : ""}
                                >
                                    <Save size={20} />
                                    {loading ? 'Saving...' : canEdit ? 'Save Rules' : 'View Only'}
                                </button>
                                <button
                                    onClick={() => handleProductSelect(selectedProduct)}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <RotateCcw size={20} />
                                    Reset
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Variant Creation Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create Product Variant</h3>
                        <p className="text-sm text-text-muted mb-4">
                            Create a new variant for this category to define specific rules.
                        </p>
                        <form onSubmit={handleCreateVariant}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Variant Name</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={variantData.name}
                                        onChange={e => setVariantData({ ...variantData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unique SKU</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        value={variantData.sku}
                                        onChange={e => setVariantData({ ...variantData, sku: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowVariantModal(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Variant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestRulesManagement;
<div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
    {message}
</div>
                                    )}

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Product Selector */}
    <div className="card p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Select Product</h2>
        <div className="flex items-center gap-2">
            <select
                value={selectedProduct?._id || ''}
                onChange={(e) => handleProductSelect(products.find(p => p._id === e.target.value))}
                className="input-field flex-1"
            >
                <option value="">-- Select a product/category --</option>
                {products.map(product => (
                    <option key={product._id} value={product._id}>
                        {product.product_name} ({product.sku})
                    </option>
                ))}
            </select>
            <button
                onClick={handleOpenVariantModal}
                className="btn btn-outline flex items-center gap-2"
                title="Create a variant for this category"
            >
                <Copy size={18} />
                Create Variant
            </button>
        </div>
    </div>

    {/* Rule Editor */}
    <div className="lg:col-span-2 space-y-6">
        {/* Template Library */}
        <div className="card p-6">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-primary mb-2">Template Library</h2>
                <p className="text-sm text-text-muted">
                    {selectedProduct
                        ? "Click a template below to apply pre-configured rules for that category"
                        : "Select a product first to apply templates"}
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(templates).map(([key, template]) => {
                    const Icon = template.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => applyTemplate(key)}
                            disabled={!selectedProduct}
                            className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${selectedProduct
                                ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:shadow-lg cursor-pointer'
                                : 'bg-gray-100 cursor-not-allowed opacity-50'
                                }`}
                            title={selectedProduct ? `Apply ${template.name}` : 'Select a product first'}
                        >
                            <Icon className={`w-8 h-8 ${selectedProduct ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium text-center">{template.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {selectedProduct && (
            <>
                {/* General Settings */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-primary mb-4">General Settings</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rules.use_logo_check || false}
                                onChange={(e) => setRules({ ...rules, use_logo_check: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="font-medium">Enable Logo Detection</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rules.use_generic_labels || false}
                                onChange={(e) => setRules({ ...rules, use_generic_labels: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="font-medium">Use Generic Category Labels</span>
                        </label>
                    </div>
                </div>

                {/* Required Identifiers */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-primary">Required Identifiers</h2>
                        <button onClick={addIdentifier} className="btn btn-primary btn-sm flex items-center gap-2">
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                    <div className="space-y-3">
                        {rules.required_identifiers?.map(identifier => (
                            <div key={identifier} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm">{identifier}</span>
                                    <button
                                        onClick={() => removeIdentifier(identifier)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Regex pattern (optional)"
                                    value={rules.identifier_patterns?.[identifier] || ''}
                                    onChange={(e) => updatePattern(identifier, e.target.value)}
                                    className="input-field text-sm font-mono"
                                />
                            </div>
                        ))}
                        {(!rules.required_identifiers || rules.required_identifiers.length === 0) && (
                            <p className="text-text-muted text-sm text-center py-4">No identifiers defined. Click "Add" to create one.</p>
                        )}
                    </div>
                </div>

                {/* Violation Weights */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-primary mb-4">Violation Weights (0-100)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'brand_mismatch',
                            'category_mismatch',
                            'logo_missing',
                            'low_similarity',
                            'medium_similarity',
                            ...rules.required_identifiers?.map(id => `missing_${id}`) || [],
                            ...rules.required_identifiers?.map(id => `invalid_${id}`) || []
                        ].map(key => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-text-main mb-1">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={weights[key] || 0}
                                    onChange={(e) => updateWeight(key, e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={saveRules}
                        disabled={loading || !canEdit}
                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        title={!canEdit ? "You don't have permission to edit rules" : ""}
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : canEdit ? 'Save Rules' : 'View Only'}
                    </button>
                    <button
                        onClick={() => handleProductSelect(selectedProduct)}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Reset
                    </button>
                </div>
            </>
        )}
    </div>
</div>

{/* Variant Creation Modal */ }
{
    showVariantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Create Product Variant</h3>
                <p className="text-sm text-text-muted mb-4">
                    Create a new variant for this category to define specific rules.
                </p>
                <form onSubmit={handleCreateVariant}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Variant Name</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                value={variantData.name}
                                onChange={e => setVariantData({ ...variantData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unique SKU</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                value={variantData.sku}
                                onChange={e => setVariantData({ ...variantData, sku: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowVariantModal(false)}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Variant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
                                </div >
                                );
};

export default TestRulesManagement;
```
