import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetLink, setResetLink] = useState('');

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
                setResetLink(data.resetLink);
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
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a password reset link</p>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="success-message">
                        <CheckCircle size={24} />
                        <h3>Reset Link Sent!</h3>
                        <p>Check your email for the password reset link.</p>
                        <div className="reset-link-box">
                            <small>For testing:</small>
                            <a href={resetLink} className="reset-link">{resetLink}</a>
                        </div>
                        <Link to="/login" className="btn btn-primary mt-1">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <Link to="/login" className="link-highlight">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
        .success-message {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .success-message svg {
          color: var(--color-success);
          margin-bottom: var(--spacing-md);
        }

        .success-message h3 {
          margin-bottom: var(--spacing-sm);
        }

        .reset-link-box {
          background-color: var(--color-background);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin: var(--spacing-lg) 0;
          word-break: break-all;
        }

        .reset-link {
          color: var(--color-accent);
          font-size: 0.875rem;
        }
      `}</style>
        </div>
    );
};

export default ForgotPassword;
