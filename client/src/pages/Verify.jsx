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
            axios.get(`/api/auth/verify?token=${token}`)
                .then(() => setStatus('success'))
                .catch(() => setStatus('error'));
        } else {
            setStatus('error');
        }
    }, [token]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-black)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div className="top-glow" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '448px', padding: '3rem', textAlign: 'center', zIndex: 10 }}
            >
                {status === 'loading' && (
                    <div className="flex-col" style={{ alignItems: 'center' }}>
                        <Loader2 size={64} style={{ color: 'white', marginBottom: '1.5rem' }} className="animate-spin" />
                        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest">Verifica in corso</h2>
                        <p className="text-muted text-sm">Stiamo attivando il tuo account Matty47ghigo Studios...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex-col" style={{ alignItems: 'center' }}>
                        <div style={{ width: '5rem', height: '5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest" style={{ color: '#4ade80' }}>Account Attivato!</h2>
                        <p className="text-muted text-sm mb-10">La tua email è stata verificata correttamente. Ora puoi accedere a tutte le funzionalità della piattaforma.</p>
                        <Link 
                            to="/login"
                            className="btn-primary flex-center"
                            style={{ gap: '0.5rem' }}
                        >
                            Vai al Login <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex-col" style={{ alignItems: 'center' }}>
                        <div style={{ width: '5rem', height: '5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <XCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest" style={{ color: '#f87171' }}>Errore Verifica</h2>
                        <p className="text-muted text-sm mb-10">Il link di attivazione non è valido o è già stato utilizzato. Se il problema persiste, contatta il supporto.</p>
                        <Link 
                            to="/"
                            className="btn-secondary"
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
