import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Si è verificato un errore.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container flex-center">
            <div className="top-glow" />
            <div className="bg-noise" />

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-auth w-full"
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                        Password Recovery
                    </h1>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Enter your email to receive a reset link
                    </p>
                </div>

                <div className="auth-card">
                    {message ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                background: 'rgba(34, 197, 94, 0.1)', 
                                color: '#4ade80', 
                                padding: '1rem', 
                                borderRadius: '0.75rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                {message}
                            </div>
                            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && (
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    color: '#f87171', 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <button 
                                disabled={loading}
                                className="btn-primary"
                                style={{ marginTop: '0.5rem' }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link to="/login" style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-dim)', 
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'color 0.2s'
                    }}>
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
