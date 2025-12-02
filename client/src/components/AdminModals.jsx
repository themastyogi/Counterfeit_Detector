import React from 'react';
import { X } from 'lucide-react';

const AdminModal = ({ show, onClose, title, children, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 transition-opacity -z-10"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-primary">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-text-muted" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={onSubmit} className="p-6">
                        {children}
                    </form>
                </div>
            </div>
        </div>
    );
};

export const TenantModal = ({ show, onClose, onSubmit, formData, setFormData, mode = 'create', plans = [] }) => {
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AdminModal
            show={show}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Tenant' : 'Edit Tenant'}
            onSubmit={onSubmit}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Tenant Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Acme Corporation"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Tenant Code <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code || ''}
                        onChange={handleChange}
                        className="input-field uppercase"
                        placeholder="e.g., ACME"
                        maxLength={10}
                        required
                    />
                    <p className="text-xs text-text-muted mt-1">
                        Unique identifier (will be converted to uppercase)
                    </p>
                </div>



                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Plan <span className="text-danger">*</span>
                    </label>
                    <select
                        name="plan"
                        value={formData.plan || ''}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">Select Plan</option>
                        {plans.map(plan => (
                            <option key={plan._id} value={plan.name}>
                                {plan.name} (${plan.price_per_month}/mo)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status || 'ACTIVE'}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn btn-primary flex-1">
                        {mode === 'create' ? 'Create Tenant' : 'Update Tenant'}
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                        Cancel
                    </button>
                </div>
            </div>
        </AdminModal >
    );
};

export const ProductModal = ({ show, onClose, onSubmit, formData, setFormData, mode = 'create' }) => {
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AdminModal
            show={show}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Product' : 'Edit Product'}
            onSubmit={onSubmit}
        >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Product Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., iPhone 15 Pro"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Brand <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Apple"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            SKU <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., APPL-IPH15P-256"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Smartphones"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="input-field"
                        rows={3}
                        placeholder="Product description..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Manufacturer Country
                        </label>
                        <input
                            type="text"
                            name="manufacturer_country"
                            value={formData.manufacturer_country || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., China"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            GTIN / Barcode
                        </label>
                        <input
                            type="text"
                            name="GTIN"
                            value={formData.GTIN || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., 0194253102526"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn btn-primary flex-1">
                        {mode === 'create' ? 'Create Product' : 'Update Product'}
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                        Cancel
                    </button>
                </div>
            </div>
        </AdminModal>
    );
};

export const UserModal = ({ show, onClose, onSubmit, formData, setFormData, mode = 'create', tenants = [] }) => {
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AdminModal
            show={show}
            onClose={onClose}
            title={mode === 'create' ? 'Create New User' : 'Edit User'}
            onSubmit={onSubmit}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., John Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Email <span className="text-danger">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., john@example.com"
                        required
                        disabled={mode === 'edit'}
                    />
                </div>

                {mode === 'create' && (
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Password <span className="text-danger">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password || ''}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Minimum 6 characters
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        Role <span className="text-danger">*</span>
                    </label>
                    <select
                        name="role"
                        value={formData.role || 'user'}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="tenant_admin">Tenant Admin</option>
                        <option value="system_admin">System Admin</option>
                    </select>
                </div>

                {formData.role !== 'system_admin' && (
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Tenant <span className="text-danger">*</span>
                        </label>
                        <select
                            name="tenant_id"
                            value={formData.tenant_id || ''}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="">Select Tenant</option>
                            {tenants.map(tenant => (
                                <option key={tenant._id} value={tenant._id}>
                                    {tenant.name} ({tenant.code})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn btn-primary flex-1">
                        {mode === 'create' ? 'Create User' : 'Update User'}
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                        Cancel
                    </button>
                </div>
            </div>
        </AdminModal>
    );
};

export default AdminModal;
