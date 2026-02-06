import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Le password non corrispondono.');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const res = await axios.post('/api/auth/reset-password', { 
                token, 
                newPassword: password 
            });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Si è verificato un errore.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container flex-center">
                <div className="auth-card" style={{ textAlign: 'center', color: '#f87171' }}>
                    Token mancante o non valido.
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container flex-center">
             <div className="top-glow" />
             <div className="bg-noise" />

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-auth w-full"
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        Reset Password
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Create a strong new password
                    </p>
                </div>

                <div className="auth-card">
                    {message ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <CheckCircle size={48} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
                            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Successo!</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{message}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '1rem' }}>Redirecting to login...</p>
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
                                <label className="input-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field"
                                        style={{ paddingRight: '2.5rem' }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-dim)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input 
                                    type="password" 
                                    required
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                disabled={loading}
                                className="btn-primary"
                                style={{ marginTop: '0.5rem' }}
                            >
                                {loading ? 'Resetting...' : 'Set New Password'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
