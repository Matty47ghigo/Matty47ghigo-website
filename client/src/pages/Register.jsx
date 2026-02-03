import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Home, MapPin, ArrowRight, Github, Chrome, MessageSquare } from 'lucide-react';
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
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post('http://localhost:3001/api/auth/register', formData);
            setMessage({ type: 'success', text: res.data.message });
            setFormData({ name: '', surname: '', email: '', password: '', address: '', cap: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Errore durante la registrazione' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#00e5ff] opacity-[0.03] blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-[#5865F2] opacity-[0.03] blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-2">
                        UNISCITI A NOI
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">Crea il tuo account per accedere alla dashboard</p>
                </div>

                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 ${
                            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <User size={18} />
                            </span>
                            <input 
                                type="text" name="name" placeholder="Nome" required
                                value={formData.name} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <User size={18} />
                            </span>
                            <input 
                                type="text" name="surname" placeholder="Cognome" required
                                value={formData.surname} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </span>
                        <input 
                            type="email" name="email" placeholder="Email aziendale o personale" required
                            value={formData.email} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                        />
                    </div>

                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                            <Lock size={18} />
                        </span>
                        <input 
                            type="password" name="password" placeholder="Password sicura" required
                            value={formData.password} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <MapPin size={18} />
                            </span>
                            <input 
                                type="text" name="address" placeholder="Indirizzo" required
                                value={formData.address} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <Home size={18} />
                            </span>
                            <input 
                                type="text" name="cap" placeholder="CAP" required
                                value={formData.cap} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 text-sm"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] active:scale-95"
                    >
                        {loading ? 'Elaborazione...' : 'Crea Account'} <ArrowRight size={20} />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-center text-gray-500 text-sm mb-6">Oppure registrati con</p>
                    <div className="flex flex-col md:flex-row gap-3">
                        <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors">
                            <Chrome size={18} className="text-red-400" /> Google
                        </button>
                        <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors">
                            <Github size={18} /> GitHub
                        </button>
                        <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors">
                            <MessageSquare size={18} className="text-[#5865F2]" /> Discord
                        </button>
                    </div>
                    
                    <p className="text-center text-gray-400 text-sm mt-8">
                        Hai già un account? <Link to="/login" className="text-primary hover:underline font-semibold">Accedi qui</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
