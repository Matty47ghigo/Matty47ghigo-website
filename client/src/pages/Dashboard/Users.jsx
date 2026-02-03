import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Mail, Globe, Calendar, CheckCircle, Clock } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-6xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <User className="text-primary" /> Utenti Registrati
                    </h2>
                    <p className="text-gray-400 text-sm">Gestisci e visualizza tutti i profili utente attivi sulla piattaforma.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/10">
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Utente</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Stato</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Provider</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Ultimo Accesso</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user, i) => (
                                <motion.tr 
                                    key={user._id || i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={user.picture || '/favicon.png'} alt="P" className="w-10 h-10 rounded-full border border-white/10" />
                                                {user.isAdmin && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border border-[#050505]">
                                                        <Shield size={10} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{user.name} {user.surname}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            {user.isVerified ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                                                    <CheckCircle size={12} /> Verificato
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                                                    <Clock size={12} /> Pendente
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Globe size={14} className="text-primary" />
                                            <span className="capitalize">{user.provider}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 text-white">
                                            <Calendar size={14} />
                                            {new Date(user.lastLogin).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                            Dettagli
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Users;
