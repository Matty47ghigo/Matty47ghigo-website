import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, MapPin, Globe, Github, Chrome, MessageSquare, Save } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isSocialUser = user.provider !== 'standard';

    const handleSave = () => {
        // Implement save logic to backend
        alert('Profilo aggiornato con successo!');
    };

    return (
        <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black mb-2">Profilo</h2>
                    <p className="text-gray-400 text-sm">Gestisci le tue informazioni personali e la sicurezza dell'account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Info */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full border-2 border-primary p-1 overflow-hidden">
                                <img src={user.picture || '/favicon.png'} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <button className="text-xs text-primary font-bold hover:underline">Cambia foto</button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Nome Completo</label>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                    <User size={18} className="text-gray-500" />
                                    <input type="text" value={`${user.name} ${user.surname || ''}`} readOnly className="bg-transparent outline-none w-full text-sm" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Email</label>
                                <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 ${isSocialUser ? 'opacity-50' : ''}`}>
                                    <Mail size={18} className="text-gray-500" />
                                    <input type="email" value={user.email} readOnly={isSocialUser} className="bg-transparent outline-none w-full text-sm" />
                                </div>
                                {isSocialUser && <p className="text-[10px] text-orange-400 mt-1">L'email non può essere modificata per gli account social.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Indirizzo</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                        <MapPin size={18} className="text-gray-500" />
                                        <input type="text" placeholder="Via..." className="bg-transparent outline-none w-full text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">CAP</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                        <Globe size={18} className="text-gray-500" />
                                        <input type="text" placeholder="00100" className="bg-transparent outline-none w-full text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSave} className="w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95">
                            <Save size={18} /> Salva Modifiche
                        </button>
                    </div>

                    {/* Social & Security */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-primary" /> Sicurezza
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Vecchia Password</label>
                                    <input type="password" disabled={isSocialUser} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Nuova Password</label>
                                    <input type="password" disabled={isSocialUser} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-sm" />
                                </div>
                                <button disabled={isSocialUser} className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all disabled:opacity-30">
                                    Aggiorna Password
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-6">Account Collegati</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Chrome size={18} className="text-red-400" />
                                        <span className="text-sm">Google</span>
                                    </div>
                                    <button className="text-xs font-bold text-primary hover:underline">{user.provider === 'google' ? 'Scollega' : 'Collega'}</button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Github size={18} />
                                        <span className="text-sm">GitHub</span>
                                    </div>
                                    <button className="text-xs font-bold text-primary hover:underline">{user.provider === 'github' ? 'Scollega' : 'Collega'}</button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare size={18} className="text-secondary" />
                                        <span className="text-sm">Discord</span>
                                    </div>
                                    <button className="text-xs font-bold text-primary hover:underline">{user.provider === 'discord' ? 'Scollega' : 'Collega'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
