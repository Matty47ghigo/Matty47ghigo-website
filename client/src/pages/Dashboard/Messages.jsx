import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, User as UserIcon, Trash2 } from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/messages')
            .then(res => setMessages(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <MessageSquare className="text-primary" /> Messaggi Ricevuti
                    </h2>
                    <p className="text-gray-400 text-sm">Controlla i messaggi inviati tramite il form dei contatti del portfolio.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-30">
                                <Mail size={48} className="mx-auto mb-4" />
                                <p>Nessun messaggio ricevuto al momento.</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div 
                                    key={msg._id || i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                                <UserIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-0.5">{msg.name || msg.sender}</p>
                                                <p className="text-xs text-gray-500 font-medium">{msg.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-gray-600 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                            {new Date(msg.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5">
                                        <p className="text-sm text-gray-300 leading-relaxed italic">"{msg.content || msg.message}"</p>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors px-4 py-2">Segna come letto</button>
                                        <button className="text-xs font-bold text-red-400/50 hover:text-red-400 transition-colors bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
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
