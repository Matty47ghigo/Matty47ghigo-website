import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, UserX, Database, ShieldAlert, Trash2 } from 'lucide-react';
import axios from 'axios';

const AdminDangerZone = () => {
    const [stats, setStats] = useState({ users: 0, tickets: 0, orders: 0 });
    const [loading, setLoading] = useState(false);

    const handleHardReset = async () => {
        const confirm1 = confirm('ATTENZIONE: Stai per eseguire un HARD RESET. Questo eliminerà TUTTI gli utenti (tranne te), tutti i ticket e tutti gli ordini.');
        if (!confirm1) return;
        
        const confirm2 = confirm('Confermi l\'azione irreversibile?');
        if (!confirm2) return;

        const password = prompt('ATTENZIONE: Questa azione eliminerà TUTTO eccetto te. Inserisci la password MASTER:');
        if (!password) return;
        if (password !== 'Matty47ghigo231747#') return alert('Password master errata!');
        try {
            const res = await axios.post('/api/admin/hard-reset', { password });
            alert(res.data.message);
            window.location.reload();
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClearCollection = async (type) => {
        const confirmAction = confirm(`Vuoi davvero eliminare tutti i ${type}?`);
        if (!confirmAction) return;

        const password = prompt('Inserisci la password di sicurezza per resettare i ticket e gli ordini:');
        if (!password) return;
        if (password !== 'Matty47ghigo231747#!') return alert('Password errata!');
        try {
            // Reusing the existing reset endpoint for specific collections or adding specialized logic
            // For now, the existing reset clears tickets and orders.
            const res = await axios.post('/api/admin/reset', { password });
            alert(res.data.message);
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h2>
                <p className="text-muted" style={{ marginBottom: '3rem' }}>
                    Azioni amministrative ad alto impatto. Gestisci il ciclo di vita dei dati della piattaforma con cautela.
                </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 md-grid-cols-1">
                {/* Hard Reset Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card" 
                    style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', padding: '2.5rem' }}
                >
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '15px' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f87171' }}>Wipe Totale (Hard Reset)</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Elimina permanentemente TUTTI i dati della piattaforma, inclusi tutti gli account utente (tranne il SuperAdmin), ticket, messaggi e ordini. Le statistiche verranno azzerate.
                            </p>
                            <button 
                                onClick={handleHardReset}
                                disabled={loading}
                                className="btn-primary" 
                                style={{ background: '#ef4444', border: 'none', width: 'auto', padding: '1rem 2rem' }}
                            >
                                <Trash2 size={18} style={{ marginRight: '0.5rem' }} /> {loading ? 'Esecuzione...' : 'Esegui Hard Reset'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Operations Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card" 
                    style={{ padding: '2.5rem' }}
                >
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' }}>Operazioni Rapide</h3>
                    <div className="flex-col gap-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border-subtle)' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Clean Support Data</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Elimina tutti i ticket e messaggi.</p>
                            </div>
                            <button onClick={() => handleClearCollection('ticket')} className="btn-secondary" style={{ width: 'auto', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>Clear</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border-subtle)' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Flush Orders</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Elimina lo storico di tutti gli ordini.</p>
                            </div>
                            <button onClick={() => handleClearCollection('ordini')} className="btn-secondary" style={{ width: 'auto', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>Clear</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border-subtle)' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Reset Visitor Count</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Azzera le visualizzazioni del sito.</p>
                            </div>
                            <button className="btn-secondary" style={{ width: 'auto', fontSize: '0.75rem' }}>Reset</button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="card" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                <div style={{ padding: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <AlertTriangle size={20} style={{ color: '#eab308' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Nota: Le eliminazioni degli utenti verranno loggate per sicurezza infrastrutturale.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDangerZone;
