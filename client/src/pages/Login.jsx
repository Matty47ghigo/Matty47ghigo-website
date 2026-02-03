import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Chrome, MessageSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:3001/api/auth/login', credentials);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.isAdmin) navigate('/dashboard');
            else navigate('/user-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Errore durante il login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const res = await axios.post('http://localhost:3001/api/auth/google', { token: response.credential });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.isAdmin) navigate('/dashboard');
            else navigate('/user-dashboard');
        } catch (err) {
            setError('Errore login Google');
        }
    };

    const handleGitHubLogin = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liaNFwaY3610bNBP&scope=user:email`;
    };

    const handleDiscordLogin = () => {
        window.location.href = 'https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify+email';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#00e5ff] opacity-[0.03] blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-[#5865F2] opacity-[0.03] blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        BENTORNATO
                    </h1>
                    <p className="text-gray-400 text-sm">Accedi al tuo account M47G Studios</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl mb-6 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </span>
                        <input 
                            type="email" name="email" placeholder="Email" required
                            value={credentials.email} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                        />
                    </div>

                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                            <Lock size={18} />
                        </span>
                        <input 
                            type="password" name="password" placeholder="Password" required
                            value={credentials.password} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                        />
                    </div>

                    <div className="text-right">
                        <button type="button" className="text-xs text-gray-500 hover:text-primary transition-colors">Password dimenticata?</button>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.2)] active:scale-95"
                    >
                        {loading ? 'Entrando...' : 'Accedi'} <LogIn size={20} />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-center text-gray-500 text-xs mb-6 uppercase tracking-widest font-bold">Oppure continua con</p>
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleGitHubLogin}
                                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
                            >
                                <Github size={18} /> GitHub
                            </button>
                            <button 
                                onClick={handleDiscordLogin}
                                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
                            >
                                <MessageSquare size={18} className="text-[#5865F2]" /> Discord
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-center text-gray-400 text-sm mt-8">
                        Non hai un account? <Link to="/register" className="text-primary hover:underline font-semibold">Crea uno qui</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
