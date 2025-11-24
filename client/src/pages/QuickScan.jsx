import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Search, AlertCircle, Loader, ScanLine, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QuickScan = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [scanMode, setScanMode] = useState('AUTO');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch products for typeahead
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                } else {
                    console.error('Failed to fetch products');
                    // Fallback to empty array
                    setProducts([]);
                }
            } catch (err) {
                console.error('Failed to fetch products', err);
                setProducts([]);
            }
        };
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleScan = async () => {
        if (!image) {
            setError('Please upload an image');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);
        formData.append('product_id', selectedProduct);
        formData.append('scan_type', scanMode);

        try {
            const res = await fetch('/api/scan/submit', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403) {
                    setError(data.message || 'Quota exceeded');
                } else {
                    setError(data.message || 'Scan failed');
                }
                setLoading(false);
                return;
            }

            // Poll for result
            const jobId = data.jobId;
            pollResult(jobId);

        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    const pollResult = async (jobId) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scan/job/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
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
            } catch (err) {
                clearInterval(interval);
                setError('Polling error');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <ScanLine className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Quick Scan</h2>
                    <p className="text-text-muted mt-1">Verify product authenticity in seconds</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-danger p-4 rounded-md flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-danger mt-0.5" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {/* 1. Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            1. Select Category
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-text-muted" />
                            </div>
                            <select
                                className="input-field pl-10 appearance-none"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                                <option value="">Select a category...</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. Scan Mode */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            2. Scan Mode
                        </label>
                        <div className="flex rounded-lg bg-background p-1 border border-border">
                            {['AUTO', 'LOCAL', 'AI_VISION'].map(mode => (
                                <button
                                    key={mode}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${scanMode === mode
                                        ? 'bg-white text-accent shadow-sm ring-1 ring-black/5'
                                        : 'text-text-muted hover:text-primary hover:bg-gray-50'
                                        }`}
                                    onClick={() => setScanMode(mode)}
                                >
                                    {mode === 'AI_VISION' ? 'AI Vision' : mode === 'LOCAL' ? 'Internal' : 'Auto'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            3. Upload Image
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${preview ? 'border-accent bg-blue-50/30' : 'border-border hover:border-accent hover:bg-gray-50'
                                }`}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            {preview ? (
                                <div className="relative inline-block">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white font-medium">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-accent" />
                                    </div>
                                    <div className="text-text-main font-medium">Click to upload or drag and drop</div>
                                    <p className="text-xs text-text-muted">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="h-px flex-1 bg-border"></div>
                            <span className="text-xs text-text-muted font-medium uppercase">OR</span>
                            <div className="h-px flex-1 bg-border"></div>
                        </div>

                        <button className="mt-4 w-full btn btn-outline flex items-center justify-center gap-2">
                            <Camera size={18} />
                            Open Camera
                        </button>
                    </div>

                    {/* Run Scan Button */}
                    <button
                        className="w-full btn btn-primary py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        onClick={handleScan}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Processing Scan...
                            </>
                        ) : (
                            <>
                                <ScanLine size={20} />
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickScan;
