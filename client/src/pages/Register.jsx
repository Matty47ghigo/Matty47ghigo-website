import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        address: '',
        cap: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', formData);
            setSuccess(res.data.message);
            // After 5 seconds, redirect to login
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error during registration. Please check your data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Subtle Gradient Backdrop */}
            <div className="top-glow" />
            
            {/* Grain Overlay */}
            <div className="bg-noise" />

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl w-full"
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ display: 'inline-block', marginBottom: '1.5rem' }}
                    >
                         <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
                            Join Us
                        </h1>
                    </motion.div>
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Create your Matty47ghigo Studios account
                    </h2>
                </div>

                <div className="auth-card">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '0.75rem', 
                                padding: '1rem', 
                                marginBottom: '1.5rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ 
                                background: 'rgba(34, 197, 94, 0.05)', 
                                border: '1px solid rgba(34, 197, 94, 0.1)', 
                                borderRadius: '1rem', 
                                padding: '2rem', 
                                marginBottom: '1.5rem', 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                color: '#4ade80',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📩</div>
                            {success}
                        </motion.div>
                    )}

                    {!success && (
                        <form onSubmit={handleRegister} className="flex-col gap-6">
                            <div className="grid grid-cols-2 gap-6" style={{ gridAutoRows: 'min-content' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Name</label>
                                    <input 
                                        type="text" name="name" placeholder="John" required
                                        value={formData.name} onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Surname</label>
                                    <input 
                                        type="text" name="surname" placeholder="Doe" required
                                        value={formData.surname} onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Email</label>
                                <input 
                                    type="email" name="email" placeholder="john.doe@example.com" required
                                    value={formData.email} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Password</label>
                                <input 
                                    type="password" name="password" placeholder="••••••••" required
                                    value={formData.password} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-6" style={{ gridAutoRows: 'min-content' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                                    <label className="input-label">Address</label>
                                    <input 
                                        type="text" name="address" placeholder="123 Main St" required
                                        value={formData.address} onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">CAP</label>
                                    <input 
                                        type="text" name="cap" placeholder="12345" required
                                        value={formData.cap} onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={loading}
                                className="btn-primary"
                                style={{ marginTop: '1rem', padding: '1.25rem' }}
                            >
                                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                        Already have an account? 
                        <Link to="/login" style={{ color: 'white', fontWeight: 700, marginLeft: '0.375rem', textDecoration: 'none' }}>Sign in here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
