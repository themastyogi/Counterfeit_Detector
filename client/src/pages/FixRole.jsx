import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

const { user, token, logout, isAuthenticated } = useAuth();
const [status, setStatus] = useState('');
const [loading, setLoading] = useState(false);

if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
                <p className="text-gray-600 mb-6">Please log in to use this tool.</p>
                <a href="/login" className="btn btn-primary w-full block py-3">Go to Login</a>
            </div>
        </div>
    );
}

const handleFixRole = async () => {
    setLoading(true);
    setStatus('');
    try {
        const res = await fetch('/api/auth/fix-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('success');
            setTimeout(() => {
                logout();
                window.location.href = '/login';
            }, 2000);
        } else {
            setStatus('error: ' + data.message);
        }
    } catch (err) {
        setStatus('error: ' + err.message);
    } finally {
        setLoading(false);
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fix Account Role</h1>
            <p className="text-gray-600 mb-6">
                Current Role: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?.role || 'Unknown'}</span>
            </p>

            {status === 'success' ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    Role updated! Redirecting...
                </div>
            ) : (
                <button
                    onClick={handleFixRole}
                    disabled={loading}
                    className="w-full btn btn-primary py-3 flex justify-center items-center gap-2"
                >
                    {loading ? 'Updating...' : 'Upgrade to Tenant Admin'}
                </button>
            )}

            {status.startsWith('error') && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-center justify-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {status}
                </div>
            )}
        </div>
    </div>
);
};

export default FixRole;
