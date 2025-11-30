import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';



function ReferenceManagement() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [references, setReferences] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchReferences();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchReferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/references', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReferences(response.data);
        } catch (error) {
            console.error('Error fetching references:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedProduct || !imageFile) {
            setMessage({ type: 'error', text: 'Please select a product and upload an image' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('product_id', selectedProduct);
            formData.append('image', imageFile);
            formData.append('notes', notes);

            await axios.post('/api/references/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Reference image uploaded successfully!' });
            setSelectedProduct('');
            setImageFile(null);
            setImagePreview(null);
            setNotes('');
            fetchReferences();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload reference image'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (referenceId) => {
        if (!confirm('Are you sure you want to delete this reference image?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/references/${referenceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Reference deleted successfully' });
            fetchReferences();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete reference'
            });
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Reference Management</h1>
                        <p className="text-text-muted mt-1">Manage reference images for product comparison</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Admin
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Upload size={20} className="text-accent" />
                                Upload New Reference
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">
                                        Select Product *
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="input w-full"
                                        required
                                    >
                                        <option value="">-- Select a product --</option>
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.product_name} ({product.sku}) - {product.brand}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedProduct && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm">
                                        {products.find(p => p._id === selectedProduct) && (
                                            <>
                                                <div className="font-semibold text-blue-900">Selected Product:</div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div><span className="text-text-muted">Name:</span> <span className="font-medium">{products.find(p => p._id === selectedProduct).product_name}</span></div>
                                                    <div><span className="text-text-muted">SKU:</span> <span className="font-medium">{products.find(p => p._id === selectedProduct).sku}</span></div>
                                                    <div><span className="text-text-muted">Brand:</span> <span className="font-medium">{products.find(p => p._id === selectedProduct).brand}</span></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">
                                        Reference Image *
                                    </label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required={!imageFile}
                                        />
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="max-h-48 mx-auto rounded-md"
                                                />
                                                <div className="mt-2 text-xs text-text-muted">Click to change</div>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <ImageIcon className="mx-auto h-10 w-10 text-text-muted mb-2" />
                                                <p className="text-sm text-text-muted">Click to upload image</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g., Official product photo from manufacturer website"
                                        className="input w-full min-h-[80px]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <>Uploading...</>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Upload Reference
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Reference List */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <ImageIcon size={20} className="text-accent" />
                                Existing References ({references.length})
                            </h2>

                            {references.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-border">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p className="text-text-muted">No reference images uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {references.map(ref => (
                                        <div key={ref._id} className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={`/${ref.reference_image_path.replace(/\\/g, '/')}`}
                                                    alt="Reference"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-primary truncate">
                                                    {ref.product_id?.product_name || 'Unknown Product'}
                                                </h3>
                                                <div className="text-sm text-text-muted mt-1 mb-3">
                                                    <p>Brand: {ref.product_id?.brand || 'N/A'}</p>
                                                    <p>Category: {ref.product_id?.category || 'N/A'}</p>
                                                </div>
                                                {ref.notes && (
                                                    <p className="text-xs text-text-muted italic bg-gray-50 p-2 rounded mb-3">
                                                        "{ref.notes}"
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                                    <div className="text-xs text-text-muted">
                                                        <div className="font-medium">
                                                            {ref.uploaded_by?.name || 'Unknown User'}
                                                        </div>
                                                        <div className="text-xs">
                                                            {new Date(ref.createdAt).toLocaleString('en-IN', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(ref._id)}
                                                        className="text-danger hover:bg-red-50 p-2 rounded-full transition-colors"
                                                        title="Delete Reference"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReferenceManagement;
