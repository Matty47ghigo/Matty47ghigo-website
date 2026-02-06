import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Mail, Globe, Calendar, CheckCircle, Clock } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('/api/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const toggleRole = async (userId, isAdmin) => {
        try {
            await axios.patch(`/api/users/${userId}/role`, { isAdmin: !isAdmin });
            fetchUsers();
        } catch (err) {
            alert('Errore aggiornamento ruolo');
        }
    };

    const toggleBan = async (userId, isBanned) => {
        if (!isBanned && !confirm('Sei sicuro di voler bannare questo utente? L\'account non potrà più autenticarsi.')) return;
        try {
            await axios.patch(`/api/users/${userId}/ban`, { isBanned: !isBanned });
            fetchUsers();
        } catch (err) {
            alert('Errore ban utente');
        }
    };

    return (
        <div style={{ maxWidth: '1152px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <User style={{ color: 'white', opacity: 0.5 }} /> Utenti Registrati
                    </h2>
                    <p className="text-muted text-sm">Gestisci e visualizza tutti i profili utente attivi sulla piattaforma.</p>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                    <th>Utente</th>
                                    <th>Stato</th>
                                    <th>Provider</th>
                                    <th>Ultimo Accesso</th>
                                    <th className="text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <motion.tr 
                                        key={user._id || i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <img src={user.picture || '/favicon.png'} alt="P" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1px solid var(--border-subtle)', objectFit: 'cover' }} />
                                                    {user.isAdmin && (
                                                        <div style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px', border: '2px solid #000' }}>
                                                            <Shield size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem' }}>{user.name} {user.surname}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {user.isVerified ? (
                                                    <span className="status-badge status-delivered" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '8px' }}>
                                                        <CheckCircle size={10} /> Verificato
                                                    </span>
                                                ) : (
                                                    <span className="status-badge status-pending" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '8px' }}>
                                                        <Clock size={10} /> Pendente
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Globe size={14} style={{ color: 'white', opacity: 0.2 }} />
                                                <span style={{ textTransform: 'capitalize' }}>{user.provider}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Calendar size={14} style={{ opacity: 0.2 }} />
                                                {new Date(user.lastLogin).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => toggleRole(user._id, user.isAdmin)}
                                                    className="btn-secondary" 
                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.65rem', borderColor: user.isAdmin ? '#00e5ff33' : 'var(--border-subtle)' }}
                                                >
                                                    {user.isAdmin ? 'Rimuovi Admin' : 'Rendi Admin'}
                                                </button>
                                                <button 
                                                    onClick={() => toggleBan(user._id, user.isBanned)}
                                                    className="btn-secondary" 
                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.65rem', borderColor: user.isBanned ? '#4ade8033' : '#ef444433', color: user.isBanned ? '#4ade80' : '#ef4444' }}
                                                >
                                                    {user.isBanned ? 'Riabilita' : 'Banna'}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Users;
