import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, RotateCcw, Plus, Trash2, BookOpen, Smartphone, Droplet, Package, FileText, Eye, Edit } from 'lucide-react';

const TestRulesManagement = () => {
    const { token, isAdmin, isTenantAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState(false); // View vs Edit mode

    // Profile State
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');

    // Rules State
    const [rules, setRules] = useState({
        use_logo_check: false,
        use_generic_labels: false,
        required_identifiers: [],
        identifier_patterns: {}
    });
    const [weights, setWeights] = useState({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

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

    useEffect(() => {
        if (selectedProduct) {
            fetchProfiles(selectedProduct._id);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (selectedProfile) {
            setRules(selectedProfile.rules || {});
            setWeights(selectedProfile.weights || {});
        } else if (selectedProduct && !selectedProfile && !isCreatingProfile) {
            // Fallback to product default rules if no profile selected (legacy support)
            const metadata = selectedProduct.metadata_json || {};
            setRules(metadata.rules || {
                use_logo_check: false,
                use_generic_labels: false,
                required_identifiers: [],
                identifier_patterns: {}
            });
            setWeights(metadata.weights || {});
        }
    }, [selectedProfile, selectedProduct]);

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

    const fetchProfiles = async (productId) => {
        try {
            const res = await fetch(`/api/test-rules/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProfiles(data);
            if (data.length > 0) {
                // Select default or first
                const defaultProfile = data.find(p => p.is_default) || data[0];
                setSelectedProfile(defaultProfile);
            } else {
                setSelectedProfile(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProfile = async () => {
        if (!newProfileName.trim() || !selectedProduct) return;
        try {
            setSaving(true);
            const res = await fetch('/api/test-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: selectedProduct._id,
                    name: newProfileName,
                    rules: rules, // Inherit current rules
                    weights: weights,
                    is_default: profiles.length === 0 // Make default if first one
                })
            });

            const data = await res.json();
            if (res.ok) {
                setProfiles([...profiles, data]);
                setSelectedProfile(data);
                setIsCreatingProfile(false);
                setNewProfileName('');
                setMessage('✅ Profile created successfully!');
            } else {
                setMessage(`❌ Failed: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error creating profile');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteProfile = async (e, profileId) => {
        e.stopPropagation();
        if (!confirm('Delete this profile?')) return;
        try {
            const res = await fetch(`/api/test-rules/${profileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const newProfiles = profiles.filter(p => p._id !== profileId);
                setProfiles(newProfiles);
                if (selectedProfile?._id === profileId) {
                    setSelectedProfile(newProfiles.length > 0 ? newProfiles[0] : null);
                }
                setMessage('✅ Profile deleted');
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error deleting profile');
        }
    };

    const handleSave = async () => {
        if (!selectedProduct) return;
        setSaving(true);

        try {
            if (selectedProfile) {
                // Update existing profile
                const res = await fetch(`/api/test-rules/${selectedProfile._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rules,
                        weights
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    // Update local state
                    setProfiles(profiles.map(p => p._id === data._id ? data : p));
                    setSelectedProfile(data);
                    setMessage('✅ Profile updated successfully!');
                } else {
                    setMessage('❌ Failed to update profile');
                }
            } else {
                // Legacy: Update ProductMaster directly (if no profiles used yet)
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
                    setMessage('✅ Default rules saved successfully!');
                    fetchProducts();
                } else {
                    setMessage('❌ Failed to save rules');
                }
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error saving rules');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
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
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Test Rules Management</h1>
                    <p className="text-text-muted">Configure validation rules and weights for each product category</p>
                </div>
                {selectedProduct && (
                    <button
                        onClick={handleSave}
                        disabled={saving || !canEdit}
                        className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar: Product & Profile Selection */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Product List */}
                    <div className="card p-4 h-96 flex flex-col">
                        <h2 className="text-lg font-bold text-primary mb-4">1. Select Product</h2>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {products.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedProduct?._id === product._id
                                        ? 'bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="font-medium">{product.product_name}</div>
                                    <div className="text-xs text-gray-500">{product.category}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Profile List */}
                    {selectedProduct && (
                        <div className="card p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-primary">2. Test Profile</h2>
                                <button
                                    onClick={() => setIsCreatingProfile(true)}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                                >
                                    <Plus size={12} /> New
                                </button>
                            </div>

                            {isCreatingProfile && (
                                <div className="mb-4 p-3 bg-gray-50 rounded border">
                                    <input
                                        type="text"
                                        placeholder="Profile Name (e.g. Strict)"
                                        className="w-full text-sm border-gray-300 rounded mb-2 p-1"
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsCreatingProfile(false)} className="text-xs text-gray-500">Cancel</button>
                                        <button onClick={handleCreateProfile} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Create</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {profiles.length === 0 && <p className="text-sm text-gray-500 italic">No profiles. Using default.</p>}
                                {profiles.map(profile => (
                                    <div key={profile._id} className="flex items-center justify-between group">
                                        <button
                                            onClick={() => setSelectedProfile(profile)}
                                            className={`flex-1 text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${selectedProfile?._id === profile._id
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FileText size={14} />
                                            {profile.name}
                                            {profile.is_default && <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600">Default</span>}
                                        </button>
                                        {selectedProfile?._id === profile._id && (
                                            <button onClick={(e) => handleDeleteProfile(e, profile._id)} className="text-gray-400 hover:text-red-600 px-2">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Content: Rule Editor */}
                <div className="lg:col-span-9 space-y-6">
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
                            {/* View/Edit Mode Toggle */}
                            {selectedProfile && (
                                <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Viewing: {selectedProfile.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedProfile.description || 'No description'}</p>
                                    </div>
                                    <button
                                        onClick={() => setViewMode(!viewMode)}
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${viewMode
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {viewMode ? <><Edit size={18} /> Edit Mode</> : <><Eye size={18} /> View Summary</>}
                                    </button>
                                </div>
                            )}

                            {/* Summary View */}
                            {viewMode && selectedProfile ? (
                                <div className="card p-6 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-2">📋 Test Rule Summary</h2>
                                        <p className="text-gray-600">Complete overview of all parameters configured for this profile</p>
                                    </div>

                                    {/* General Settings Summary */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                            <Settings size={18} />
                                            General Settings
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${rules.use_logo_check ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className="text-sm">Logo Detection: <strong>{rules.use_logo_check ? 'Enabled' : 'Disabled'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${rules.use_generic_labels ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className="text-sm">Generic Labels Check: <strong>{rules.use_generic_labels ? 'Enabled' : 'Disabled'}</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Required Identifiers Summary */}
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <h3 className="font-bold text-purple-900 mb-3">🔍 Required Identifiers</h3>
                                        {rules.required_identifiers && rules.required_identifiers.length > 0 ? (
                                            <div className="space-y-2">
                                                {rules.required_identifiers.map(identifier => (
                                                    <div key={identifier} className="bg-white p-3 rounded border border-purple-100">
                                                        <div className="font-semibold text-purple-900 capitalize">{identifier.replace(/_/g, ' ')}</div>
                                                        {rules.identifier_patterns?.[identifier] && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Pattern: <code className="bg-gray-100 px-2 py-0.5 rounded">{rules.identifier_patterns[identifier]}</code>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 italic">No required identifiers configured</p>
                                        )}
                                    </div>

                                    {/* Violation Weights Summary */}
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <h3 className="font-bold text-amber-900 mb-3">⚖️ Violation Weights (Risk Scores)</h3>
                                        {weights && Object.keys(weights).length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {Object.entries(weights).map(([key, value]) => {
                                                    const severity = value >= 50 ? 'high' : value >= 30 ? 'medium' : 'low';
                                                    const colorClass = severity === 'high' ? 'bg-red-100 border-red-300 text-red-900'
                                                        : severity === 'medium' ? 'bg-orange-100 border-orange-300 text-orange-900'
                                                            : 'bg-yellow-100 border-yellow-300 text-yellow-900';

                                                    return (
                                                        <div key={key} className={`p-3 rounded border ${colorClass}`}>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                                                <span className="font-bold text-lg">{value}</span>
                                                            </div>
                                                            <div className="mt-1 bg-white bg-opacity-50 rounded-full h-2">
                                                                <div
                                                                    className={`h-full rounded-full ${severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                                                                    style={{ width: `${value}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 italic">No violation weights configured</p>
                                        )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-bold text-gray-900 mb-2">📝 Profile Metadata</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="text-gray-600">Profile ID:</span> <code className="text-xs bg-white px-2 py-0.5 rounded">{selectedProfile._id}</code></div>
                                            <div><span className="text-gray-600">Default Profile:</span> <strong>{selectedProfile.is_default ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">Created:</span> {new Date(selectedProfile.createdAt).toLocaleDateString()}</div>
                                            <div><span className="text-gray-600">Last Modified:</span> {new Date(selectedProfile.updatedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
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
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestRulesManagement;
