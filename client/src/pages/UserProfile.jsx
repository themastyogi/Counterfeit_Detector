import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, CheckCircle, XCircle, CreditCard, LayoutGrid } from 'lucide-react';

const UserProfile = () => {
    const { user, token, hasFeature } = useAuth();
    const [tenant, setTenant] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user?.tenant_id) {
                try {
                    // Fetch tenant details
                    const tenantRes = await fetch(`/api/tenants/${user.tenant_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (tenantRes.ok) {
                        const tenantData = await tenantRes.json();
                        setTenant(tenantData);

                        // Fetch plan details
                        // Note: In a real app, you might have a dedicated endpoint for this
                        // For now, we'll assume we can get plan details from the tenant or a separate call
                        // This is a placeholder for fetching plan details based on tenant.plan
                    }
                } catch (err) {
                    console.error('Error fetching profile data', err);
                }
            }
            setLoading(false);
        };

        fetchProfileData();
    }, [user, token]);

    if (loading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    const features = [
        { name: 'Reference Comparison', key: 'reference_comparison', description: 'Compare scans against official reference images' },
        { name: 'AI Vision Analysis', key: 'ai_vision', description: 'Advanced AI detection for logos and text' },
        { name: 'Batch Scanning', key: 'batch_scan', description: 'Scan multiple items in sequence' },
        { name: 'API Access', key: 'api_access', description: 'Direct access to detection API' }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-primary mb-2">User Profile</h1>
            <p className="text-text-muted mb-8">Manage your account and subscription settings</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="card bg-white p-6 shadow-sm border border-border">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-4">
                                <User size={48} />
                            </div>
                            <h2 className="text-xl font-bold text-primary">{user?.fullName}</h2>
                            <p className="text-text-muted">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium uppercase tracking-wide">
                                {user?.role?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="border-t border-border pt-4">
                            <div className="flex justify-between py-2">
                                <span className="text-text-muted">Status</span>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-text-muted">Member Since</span>
                                <span className="text-primary">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan & Features */}
                <div className="md:col-span-2 space-y-6">
                    {/* Subscription Plan */}
                    <div className="card bg-white p-6 shadow-sm border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <CreditCard size={20} />
                                Subscription Plan
                            </h3>
                            <button className="btn btn-outline text-sm">Change Plan</button>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-2xl font-bold text-primary mb-1">{tenant?.plan || 'Standard'} Plan</h4>
                                    <p className="text-text-muted text-sm">
                                        {tenant?.name ? `Licensed to ${tenant.name}` : 'Personal Account'}
                                    </p>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-lg shadow-sm text-sm font-bold text-blue-600">
                                    Active
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-white/60 p-3 rounded-lg">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Local Scans</div>
                                    <div className="font-bold text-primary">Unlimited</div>
                                </div>
                                <div className="bg-white/60 p-3 rounded-lg">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">AI Scans</div>
                                    <div className="font-bold text-primary">100 / month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Availability */}
                    <div className="card bg-white p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                            <Shield size={20} />
                            Feature Availability
                        </h3>

                        <div className="space-y-4">
                            {features.map(feature => {
                                const isEnabled = hasFeature(feature.key) || (feature.key === 'ai_vision'); // Default true for demo
                                return (
                                    <div key={feature.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {isEnabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-primary">{feature.name}</div>
                                                <div className="text-xs text-text-muted">{feature.description}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {isEnabled ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">ENABLED</span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">LOCKED</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
