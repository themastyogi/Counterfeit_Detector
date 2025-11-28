import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            const response = await axios.get(`${API_URL}/api/products`, {
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
            const response = await axios.get(`${API_URL}/api/references`, {
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

            const response = await axios.post(`${API_URL}/api/references/upload`, formData, {
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
            await axios.delete(`${API_URL}/api/references/${referenceId}`, {
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
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Reference Image Management</h1>
                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Admin
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Upload Form */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Upload New Reference Image
                </h2>

                <form onSubmit={handleUpload}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Select Product *
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }}
                            required
                        >
                            <option value="">-- Select a product --</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.product_name} - {product.brand} ({product.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Reference Image *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem'
                            }}
                            required
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    marginTop: '1rem',
                                    maxWidth: '300px',
                                    maxHeight: '300px',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Official product photo from manufacturer website"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                minHeight: '80px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Uploading...' : 'Upload Reference Image'}
                    </button>
                </form>
            </div>

            {/* Reference List */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Existing Reference Images ({references.length})
                </h2>

                {references.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                        No reference images uploaded yet
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {references.map(ref => (
                            <div key={ref._id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                backgroundColor: '#f9fafb'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <img
                                        src={`${API_URL}/${ref.reference_image_path}`}
                                        alt="Reference"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '0.375rem'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>{ref.product_id?.product_name || 'Unknown Product'}</strong>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                    Brand: {ref.product_id?.brand || 'N/A'}<br />
                                    Category: {ref.product_id?.category || 'N/A'}
                                </div>
                                {ref.notes && (
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                        {ref.notes}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
                                    Uploaded: {new Date(ref.createdAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => handleDelete(ref._id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReferenceManagement;
