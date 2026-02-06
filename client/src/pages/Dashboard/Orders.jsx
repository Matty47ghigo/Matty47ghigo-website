import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Clock, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Orders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user._id) {
            axios.get(`/api/users/${user._id}/orders`)
                .then(res => setOrders(res.data))
                .catch(err => console.error(err));
        }
    }, [user._id]);

    const getStatusClass = (status) => {
        switch(status) {
            case 'consegnato': return 'status-delivered';
            case 'contabilizzare': return 'status-processing';
            default: return 'status-closed';
        }
    };

    return (
        <div style={{ maxWidth: '1024px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">I miei Ordini</h2>
                    <p className="text-muted text-sm">Visualizza la cronologia dei tuoi acquisti e lo stato dei lavori.</p>
                </div>

                <div className="flex-col gap-4">
                    <AnimatePresence>
                        {orders.map((order, i) => (
                            <motion.div 
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card"
                                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
                            >
                                <div style={{ width: '5rem', height: '5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={order.items[0].img} alt="Order" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                                </div>

                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <span className="text-dim font-bold tracking-widest uppercase" style={{ fontSize: '9px' }}>{order.id}</span>
                                        <span className={`status-badge ${getStatusClass(order.status)}`} style={{ fontSize: '8px' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem', color: 'white' }}>{order.items[0].name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <span className="flex-center" style={{ gap: '0.25rem' }}><Clock size={14} /> {order.date}</span>
                                        <span className="flex-center" style={{ gap: '0.25rem' }}><CheckCircle size={14} /> Fatturato</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="text-dim font-bold uppercase tracking-widest mb-1" style={{ fontSize: '9px' }}>Totale</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>€{order.total.toFixed(2)}</p>
                                    </div>
                                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--border-subtle)' }}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="card flex-col" style={{ padding: '3rem', borderStyle: 'dashed', textAlign: 'center', alignItems: 'center', justifyContent: 'center', opacity: 0.3, transition: 'var(--transition-smooth)' }}>
                    <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                        <ShoppingCart size={32} style={{ opacity: 0.5 }} />
                    </div>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sfogliate i nostri servizi</p>
                    <p className="text-xs text-dim">Nuovi pacchetti disponibili ogni mese.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Orders;
