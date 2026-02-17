import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, ShieldCheck, Lock, X } from 'lucide-react';
import api from '../../utils/api';
import CreditCardForm from '../../components/CreditCard';

const Payments = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [methods, setMethods] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?._id) {
            fetchMethods();
        }
    }, [user?._id]);

    const fetchMethods = async () => {
        try {
            const res = await api.get(`/api/users/${user._id}/payments`);
            setMethods(res.data || []);
        } catch (err) {
            console.error("Fetch Payments Error:", err);
            setMethods([]);
        }
    };

    const handleSaveCard = async (cardData) => {
        setLoading(true);
        try {
            const res = await api.post(`/api/users/${user._id}/payments`, {
                type: 'Carta',
                last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
                brand: cardData.cardType
            });
            setMethods(res.data);
            setShowAddModal(false);
        } catch (err) {
            alert('Errore aggiunta carta: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const removeMethod = async (paymentId) => {
        if (!confirm('Eliminare questo metodo di pagamento?')) return;
        try {
            const res = await api.delete(`/api/users/${user._id}/payments/${paymentId}`);
            setMethods(res.data);
        } catch (err) {
            alert('Errore eliminazione');
        }
    };

    return (
        <div style={{ maxWidth: '896px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Pagamenti</h2>
                        <p className="text-muted text-sm">Gestisci i tuoi metodi di pagamento e le preferenze di fatturazione.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                        <Plus size={20} /> Aggiungi
                    </button>
                </div>

                <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
                    <AnimatePresence>
                        {methods.map((method) => (
                            <motion.div 
                                key={method.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card"
                                style={{ position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.05 }}>
                                    <CreditCard size={64} style={{ color: 'white' }} />
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                    <div style={{ padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                                        {method.type}
                                    </div>
                                    {method.isDefault && (
                                        <span className="status-badge status-delivered" style={{ fontSize: '8px' }}>
                                            Predefinito
                                        </span>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <p className="text-dim font-bold uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Numero Carta</p>
                                    <p style={{ fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '0.2em', color: 'white' }}>•••• •••• •••• {method.last4}</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>Rendi Predefinito</button>
                                    <button onClick={() => removeMethod(method._id)} style={{ background: 'none', border: 'none', color: '#f87171', opacity: 0.5, cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="alert-box">
                    <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={28} style={{ opacity: 0.5 }} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem', color: 'white' }}>I tuoi dati sono al sicuro</h4>
                        <p className="text-sm text-dim" style={{ lineHeight: 1.6 }}>
                            Utilizziamo crittografia di grado militare (AES-256) per proteggere le tue informazioni. I dati della carta non vengono mai salvati direttamente sui nostri server ma gestiti tramite partner certificati PCI-DSS.
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {showAddModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem' }}>
                                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 className="text-xl font-bold">Aggiungi Carta</h3>
                                    <X size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setShowAddModal(false)} />
                                </div>
                                <CreditCardForm 
                                    onSave={handleSaveCard}
                                    savedCard={null}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Payments;

