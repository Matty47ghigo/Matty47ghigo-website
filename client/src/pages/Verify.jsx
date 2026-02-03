import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        if (token) {
            axios.get(`http://localhost:3001/api/auth/verify?token=${token}`)
                .then(() => setStatus('success'))
                .catch(() => setStatus('error'));
        } else {
            setStatus('error');
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#00e5ff] opacity-[0.03] blur-[120px] rounded-full" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl relative z-10"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 size={64} className="text-primary animate-spin mb-6" />
                        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Verifica in corso</h2>
                        <p className="text-gray-400 text-sm">Stiamo attivando il tuo account M47G Studios...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-green-400">Account Attivato!</h2>
                        <p className="text-gray-400 text-sm mb-10">La tua email è stata verificata correttamente. Ora puoi accedere a tutte le funzionalità della piattaforma.</p>
                        <Link 
                            to="/login"
                            className="w-full bg-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.02] transition-all"
                        >
                            Vai al Login <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                            <XCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-red-400">Errore Verifica</h2>
                        <p className="text-gray-400 text-sm mb-10">Il link di attivazione non è valido o è già stato utilizzato. Se il problema persiste, contatta il supporto.</p>
                        <Link 
                            to="/"
                            className="w-full bg-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                        >
                            Torna alla Home
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Verify;
