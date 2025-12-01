import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Search, AlertCircle, Loader, ScanLine, Check, Settings, Image, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QuickScan = () => {
    const navigate = useNavigate();
    const { token, isAdmin, isTenantAdmin } = useAuth();

    // Data State
    const [products, setProducts] = useState([]);
    const [references, setReferences] = useState([]);
    const [testProfiles, setTestProfiles] = useState([]);

    // Selection State
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedReference, setSelectedReference] = useState('');
    const [selectedTestProfile, setSelectedTestProfile] = useState('');
    const [scanMode, setScanMode] = useState('AUTO');

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [referenceSearchQuery, setReferenceSearchQuery] = useState('');
    const [showReferenceResults, setShowReferenceResults] = useState(false);

    // Image State
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);

    // Processing State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        if (token) {
            fetchProducts();
            fetchAllReferences();
        }
    }, [token]);

    // Fetch Profiles when Product Changes
    useEffect(() => {
        if (selectedProduct) {
            fetchTestProfiles(selectedProduct);
        } else {
            setTestProfiles([]);
            setSelectedTestProfile('');
        }
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    const fetchAllReferences = async () => {
        try {
            const res = await fetch('/api/references', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setReferences(data);
            }
        } catch (err) {
            console.error('Error fetching references', err);
        }
    };

    const fetchTestProfiles = async (productId) => {
        try {
            const res = await fetch(`/api/test-rules/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTestProfiles(data);
                // Auto-select default if available
                const defaultProfile = data.find(p => p.is_default);
                if (defaultProfile) setSelectedTestProfile(defaultProfile._id);
            }
        } catch (err) {
            console.error('Error fetching profiles', err);
        }
    };

    // Filtering Logic
    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredReferences = references.filter(r => {
        // Filter by selected product if one is chosen
        if (selectedProduct && r.product_id?._id !== selectedProduct) return false;

        const productName = r.product_id?.product_name || '';
        const notes = r.notes || '';
        const query = referenceSearchQuery.toLowerCase();
        return productName.toLowerCase().includes(query) || notes.toLowerCase().includes(query);
    });

    // Handlers
    const handleSelectProduct = (product) => {
        setSelectedProduct(product._id);
        setSearchQuery(product.product_name);
        setShowSearchResults(false);
        // Reset reference when product changes
        setSelectedReference('');
        setReferenceSearchQuery('');
    };

    const handleSelectReference = (reference) => {
        setSelectedReference(reference._id);
        const name = reference.product_id?.product_name || 'Unknown Product';
        const id = reference.notes ? ` - ${reference.notes}` : '';
        setReferenceSearchQuery(`${name}${id}`);
        setShowReferenceResults(false);

        // Auto-select the category if not already selected
        if (reference.product_id?._id && reference.product_id._id !== selectedProduct) {
            setSelectedProduct(reference.product_id._id);
            setSearchQuery(reference.product_id.product_name);
        }
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Camera Logic
    const handleOpenCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            setShowCamera(true);
            setTimeout(() => {
                const video = document.getElementById('cameraVideo');
                if (video) video.srcObject = mediaStream;
            }, 100);
        } catch (err) {
            setError('Camera access denied or not available');
        }
    };

    const handleCapturePhoto = () => {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setImage(file);
            setPreview(URL.createObjectURL(blob));
            handleCloseCamera();
        }, 'image/jpeg', 0.95);
    };

    const handleCloseCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    // Submit Logic
    const handleScan = async () => {
        if (!image) {
            setError('Please upload an image');
            return;
        }
        if (!selectedProduct) {
            setError('Please select a product category');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);
        formData.append('product_id', selectedProduct);
        formData.append('scan_type', scanMode);

        if (selectedReference) {
            formData.append('reference_id', selectedReference);
        }
        if (selectedTestProfile) {
            formData.append('test_rule_id', selectedTestProfile);
        }

        try {
            const res = await fetch('/api/scan/submit', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Scan failed');
                setLoading(false);
                return;
            }
            pollResult(data.jobId);
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    const pollResult = async jobId => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scan/job/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.status === 'COMPLETED') {
                    clearInterval(interval);
                    navigate('/scan-result', { state: { result: data.result } });
                } else if (data.status === 'FAILED') {
                    clearInterval(interval);
                    setError('Scan processing failed');
                    setLoading(false);
                }
            } catch (e) {
                clearInterval(interval);
                setError('Polling error');
                setLoading(false);
            }
        }, 1000);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.search-container')) setShowSearchResults(false);
            if (!e.target.closest('.reference-search-container')) setShowReferenceResults(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Main Scan Area */}
                <div className="lg:col-span-3">
                    <div className="card bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-primary mb-4">Quick Scan</h2>

                        {error && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* 1. Category Selection */}
                        <div className="mb-6 search-container relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">1. Select Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search product category..."
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchResults(true);
                                        if (e.target.value === '') setSelectedProduct('');
                                    }}
                                    onFocus={() => setShowSearchResults(true)}
                                />
                                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />

                                {showSearchResults && searchQuery && filteredProducts.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p._id}
                                                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                                                onClick={() => handleSelectProduct(p)}
                                            >
                                                <div className="font-medium text-gray-900">{p.product_name}</div>
                                                <div className="text-xs text-gray-500">{p.category} • {p.brand}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Advanced Options Section */}
                        {selectedProduct && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Advanced Options</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* 2. Test Profile Selection */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Test Profile</label>
                                        <div className="relative">
                                            <select
                                                value={selectedTestProfile}
                                                onChange={(e) => setSelectedTestProfile(e.target.value)}
                                                className="w-full p-2 pl-9 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Default (Standard Rules)</option>
                                                {testProfiles.map(profile => (
                                                    <option key={profile._id} value={profile._id}>
                                                        {profile.name} {profile.is_default ? '(Default)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* 3. Reference Selection */}
                                    <div className="reference-search-container relative">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Reference Image</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Auto-Match (Best Fit)"
                                                className="w-full p-2 pl-9 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                value={referenceSearchQuery}
                                                onChange={(e) => {
                                                    setReferenceSearchQuery(e.target.value);
                                                    setShowReferenceResults(true);
                                                    if (e.target.value === '') setSelectedReference('');
                                                }}
                                                onFocus={() => setShowReferenceResults(true)}
                                            />
                                            <Image className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />

                                            {showReferenceResults && filteredReferences.length > 0 && (
                                                <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
                                                    <div
                                                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-indigo-600 font-medium border-b border-gray-100"
                                                        onClick={() => {
                                                            setSelectedReference('');
                                                            setReferenceSearchQuery('');
                                                            setShowReferenceResults(false);
                                                        }}
                                                    >
                                                        ✨ Auto-Match (Best Fit)
                                                    </div>
                                                    {filteredReferences.map(r => (
                                                        <div
                                                            key={r._id}
                                                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                                                            onClick={() => handleSelectReference(r)}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{r.product_id?.product_name}</div>
                                                                <div className="text-xs text-gray-500">{r.notes || 'No description'}</div>
                                                            </div>
                                                            {selectedReference === r._id && <Check size={14} className="text-green-500" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Scan Mode */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Scan Mode</label>
                            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
                                {['AUTO', 'LOCAL', 'AI_VISION'].map(mode => (
                                    <button
                                        key={mode}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${scanMode === mode
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        onClick={() => setScanMode(mode)}
                                    >
                                        {mode === 'AI_VISION' ? 'AI Vision' : mode === 'LOCAL' ? 'Internal' : 'Auto'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image <span className="text-red-500">*</span></label>
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${preview ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                    }`}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="preview" className="max-h-64 mx-auto rounded shadow-sm" />
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 mx-auto text-indigo-400 mb-3" />
                                        <p className="text-gray-900 font-medium">Click to upload or drag &amp; drop</p>
                                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
                                    </>
                                )}
                                <input type="file" id="fileInput" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <div className="relative flex py-3 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button className="btn btn-outline w-full py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50" onClick={handleOpenCamera} type="button">
                                <Camera size={18} className="mr-2" /> Open Camera
                            </button>
                        </div>

                        {/* Scan Button */}
                        <button
                            className={`w-full py-3 px-4 rounded-lg shadow-sm text-white font-medium text-lg flex items-center justify-center transition-colors ${loading || !selectedProduct || !image
                                    ? 'bg-indigo-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            onClick={handleScan}
                            disabled={loading || !selectedProduct || !image}
                        >
                            {loading ? (
                                <><Loader className="animate-spin mr-2" size={24} /> Processing...</>
                            ) : (
                                <><ScanLine className="mr-2" size={24} /> Run Analysis</>
                            )}
                        </button>
                    </div>

                    {/* Camera Modal */}
                    {showCamera && (
                        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-xl max-w-md w-full p-4 overflow-hidden">
                                <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] mb-4">
                                    <video id="cameraVideo" autoPlay playsInline className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleCapturePhoto} className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2">
                                        <Camera size={20} /> Capture
                                    </button>
                                    <button onClick={handleCloseCamera} className="flex-1 btn btn-outline py-3">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel - Admin Tools */}
                {(isAdmin || isTenantAdmin) && (
                    <div className="lg:col-span-1">
                        <div className="card bg-white rounded-xl shadow-lg p-5 sticky top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Tools</h3>

                            {/* Test Rules */}
                            <button
                                onClick={() => navigate('/test-rules')}
                                className="w-full mb-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-100 rounded-xl transition-all text-left group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                        <Settings className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-purple-900 text-sm mb-0.5">Test Rules</h4>
                                        <p className="text-xs text-purple-600">Configure validation logic</p>
                                    </div>
                                </div>
                            </button>

                            {/* Reference Management */}
                            <button
                                onClick={() => navigate('/references')}
                                className="w-full p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-100 rounded-xl transition-all text-left group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                        <Image size={20} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900 text-sm mb-0.5">References</h4>
                                        <p className="text-xs text-blue-600">Manage reference images</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickScan;
