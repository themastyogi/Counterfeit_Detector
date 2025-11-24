import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle, KeyRound, Shield } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email) {
            setError('Please enter your email');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">VeriScan</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-4">
                                    <KeyRound className="h-7 w-7 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-primary mb-2">Forgot Password?</h2>
                                <p className="text-text-muted text-sm">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-danger p-4 rounded-md flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-text-muted" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn btn-primary py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back to Login */}
                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowRight size={16} className="rotate-180" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-2">Check Your Email!</h3>
                            <p className="text-text-muted mb-6">
                                We've sent password reset instructions to <strong className="text-primary">{email}</strong>
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Didn't receive the email?</strong><br />
                                    Check your spam folder or try again in a few minutes.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="btn btn-primary w-full py-3"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-muted">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-accent hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
