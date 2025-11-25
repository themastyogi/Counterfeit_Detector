import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Search, AlertCircle, Loader, ScanLine, Mail, ArrowRight, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QuickScan = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [scanMode, setScanMode] = useState('AUTO');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');

    // Fetch product categories
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                } else {
                    console.error('Failed to fetch products');
                    setProducts([]);
                }
            } catch (err) {
                console.error('Error fetching products', err);
                setProducts([]);
            }
        };
        if (token) fetchProducts();
    }, [token]);

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

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
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Scan failed');
                setLoading(false);
                return;
            }
            const jobId = data.jobId;
            pollResult(jobId);
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

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="card bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Quick Scan</h2>
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-danger p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-danger" />
                        <span className="text-sm text-danger">{error}</span>
                    </div>
                )}
                {/* Category Search */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-1">Select Category</label>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="input-field w-full pl-10 mb-2"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="input-field w-full"
                        value={selectedProduct}
                        onChange={e => setSelectedProduct(e.target.value)}
                    >
                        <option value="">-- Choose Category --</option>
                        {filteredProducts.map(p => (
                            <option key={p._id} value={p._id}>{p.product_name}</option>
                        ))}
                    </select>
                </div>
                {/* Scan Mode */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-1">Scan Mode</label>
                    <div className="flex rounded-lg bg-background p-1 border border-border">
                        {['AUTO', 'LOCAL', 'AI_VISION'].map(mode => (
                            <button
                                key={mode}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${scanMode === mode ? 'bg-white text-accent shadow-sm' : 'text-text-muted hover:bg-gray-50 hover:text-primary'}`}
                                onClick={() => setScanMode(mode)}
                            >
                                {mode === 'AI_VISION' ? 'AI Vision' : mode === 'LOCAL' ? 'Internal' : 'Auto'}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Image Upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-1">Upload Image</label>
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${preview ? 'border-accent bg-blue-50/30' : 'border-border hover:border-accent hover:bg-gray-50'}`}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="max-h-64 mx-auto rounded" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mx-auto text-accent mb-2" />
                                <p className="text-text-main">Click to upload or drag &amp; drop</p>
                                <p className="text-xs text-text-muted">SVG, PNG, JPG or GIF (max 5MB)</p>
                            </>
                        )}
                        <input type="file" id="fileInput" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                    <div className="flex items-center justify-center my-2 text-xs text-text-muted">OR</div>
                    <button className="btn btn-outline w-full" onClick={handleOpenCamera} type="button">
                        <Camera size={18} className="mr-2" /> Open Camera
                    </button>
                </div>
                {/* Scan Button */}
                <button
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-2"
                    onClick={handleScan}
                    disabled={loading}
                >
                    {loading ? <Loader className="animate-spin" size={20} /> : <><ScanLine size={20} className="mr-2" /> Run Analysis</>}
                </button>
            </div>
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-primary">Capture Photo</h3>
                            <button onClick={handleCloseCamera} className="text-text-muted hover:text-primary">✕</button>
                        </div>
                        <video id="cameraVideo" autoPlay playsInline className="w-full h-auto" />
                        <div className="mt-4 flex gap-3">
                            <button onClick={handleCapturePhoto} className="flex-1 btn btn-primary flex items-center justify-center gap-2">
                                <Camera size={18} /> Capture Photo
                            </button>
                            <button onClick={handleCloseCamera} className="flex-1 btn btn-outline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickScan;
