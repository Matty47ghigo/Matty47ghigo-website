import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, User as UserIcon, Trash2 } from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        axios.get('/api/messages')
            .then(res => setMessages(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ maxWidth: '1024px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <MessageSquare style={{ color: 'white', opacity: 0.5 }} /> Messaggi Ricevuti
                    </h2>
                    <p className="text-muted text-sm">Controlla i messaggi inviati tramite il form dei contatti del portfolio.</p>
                </div>

                <div className="flex-col gap-4">
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '5rem 0', opacity: 0.3, borderStyle: 'dashed' }}>
                                <Mail size={48} style={{ margin: '0 auto 1.5rem' }} />
                                <p className="text-sm">Nessun messaggio ricevuto al momento.</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div 
                                    key={msg._id || i}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card"
                                    style={{ position: 'relative' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                                                <UserIcon size={24} style={{ opacity: 0.5 }} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{msg.name || msg.sender}</p>
                                                <p className="text-xs text-dim font-bold">{msg.email}</p>
                                            </div>
                                        </div>
                                        <span className="badge">
                                            {new Date(msg.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                    
                                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }}>
                                        <p className="text-sm italic" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>"{msg.content || msg.message}"</p>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Segna come letto</button>
                                        <button className="flex-center" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.75rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', gap: '0.5rem' }}>
                                            <Trash2 size={14} /> Elimina
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Messages;
