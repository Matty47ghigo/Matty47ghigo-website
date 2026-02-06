import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Chrome, MessageSquare, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempUserId, setTempUserId] = useState(localStorage.getItem('tempUserId') || '');
    const [tempId, setTempId] = useState(localStorage.getItem('tempId') || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Check for 2FA data on mount
    useEffect(() => {
        if (tempUserId && tempId) {
            setRequires2FA(true);
        }
    }, [tempUserId, tempId]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/login', credentials);
            
            if (res.data.message === '2FA_REQUIRED') {
                setRequires2FA(true);
                setTempUserId(res.data.userId);
                return;
            }

            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    const handle2FAVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/2fa/login-verify', {
                userId: tempUserId || localStorage.getItem('tempUserId'),
                token: verificationCode
            });
            localStorage.removeItem('tempUserId');
            localStorage.removeItem('tempId');
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Codice non valido o scaduto.');
        } finally {
            setLoading(false);
        }
    };

    const requestEmailCode = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/2fa/send-email-code', { userId: tempUserId || localStorage.getItem('tempUserId') });
            alert(res.data.message);
        } catch (err) {
            setError('Errore durante l\'invio dell\'email. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const res = await axios.post('/api/auth/google', { token: response.credential });
            
            if (res.data.message === '2FA_REQUIRED') {
                setRequires2FA(true);
                setTempUserId(res.data.userId);
                setTempId(res.data.tempId);
                localStorage.setItem('tempUserId', res.data.userId);
                localStorage.setItem('tempId', res.data.tempId);
                return;
            }

            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError('Google authentication failed.');
        }
    };

    const handleGitHubLogin = () => {
        localStorage.setItem('auth_provider', 'github');
        window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liaNFwaY3610bNBP&scope=user:email&redirect_uri=http://localhost:5173/callback`;
    };

    const handleDiscordLogin = () => {
        localStorage.setItem('auth_provider', 'discord');
        window.location.href = 'https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify+email';
    };

    return (
        <div className="auth-container flex-center">
            {/* Subtle Gradient Backdrop */}
            <div className="top-glow" />
            
            {/* Grain Overlay */}
            <div className="bg-noise" />

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-auth w-full"
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ display: 'inline-block', marginBottom: '1.5rem' }}
                    >
                         <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                            Matty47ghigo Studios
                        </h1>
                    </motion.div>
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Sign in to your account to continue
                    </h2>
                </div>

                <div className="auth-card">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '0.75rem', 
                                padding: '1rem', 
                                marginBottom: '1.5rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                            {error}
                        </motion.div>
                    )}

                    {requires2FA ? (
                         <form onSubmit={handle2FAVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label" style={{ textAlign: 'center', width: '100%' }}>Codice di Sicurezza</label>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '1rem' }}>
                                    Inserisci il codice dall'app Authenticator o un codice di backup.
                                </p>
                                <input 
                                    type="text" 
                                    placeholder="000000" 
                                    required
                                    autoFocus
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="input-field"
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', height: '4rem' }}
                                />
                            </div>

                            <button 
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Verifica...' : 'Verifica & Accedi'}
                            </button>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                <button 
                                    type="button"
                                    onClick={requestEmailCode}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Usa codice via Email
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setRequires2FA(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    Torna al login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input 
                                    type="email" name="email" placeholder="name@company.com" required
                                    value={credentials.email} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
                                    <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                                    <Link to="/forgot-password" style={{ 
                                        fontSize: '0.625rem', 
                                        fontWeight: 700, 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.1em', 
                                        color: 'var(--text-dim)', 
                                        textDecoration: 'none' 
                                    }}>Forgot?</Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required
                                        value={credentials.password} onChange={handleChange}
                                        className="input-field"
                                        style={{ marginTop: '0.5rem', paddingRight: '2.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '60%',
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

                            <button 
                                disabled={loading}
                                className="btn-primary"
                                style={{ marginTop: '1rem' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <CornerDownRight size={14} />}
                            </button>
                        </form>
                    )}

                    {/* In-page forgot logic removed */ }

                    {!requires2FA && (
                         <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/" style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--text-dim)', 
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'color 0.2s'
                            }}>
                                ← Torna a M47G Studios
                            </Link>
                        </div>
                    )}

                    <div className="divider">
                        <div className="divider-line" />
                        <span className="divider-text">Or continue with</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={handleGitHubLogin} className="btn-social">
                            <Github size={16} /> GitHub
                        </button>
                        <button type="button" onClick={handleDiscordLogin} className="btn-social" style={{ borderColor: 'rgba(114, 137, 218, 0.2)' }}>
                            <MessageSquare size={16} style={{ color: '#7289da' }} /> Discord
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ opacity: 0.6 }}>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google LogIn Failed')}
                                theme="outline"
                                shape="pill"
                                size="medium"
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                        Don't have an account? 
                        <Link to="/register" style={{ color: 'white', fontWeight: 700, marginLeft: '0.375rem', textDecoration: 'none' }}>Sign up</Link>
                    </p>
                </div>

                <footer style={{ marginTop: '5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#27272a', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                        © 2026 Matty47ghigo Studios
                    </p>
                </footer>
            </motion.div>
        </div>
    );
};

export default Login;
