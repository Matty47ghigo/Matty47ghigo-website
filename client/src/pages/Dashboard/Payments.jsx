import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, ShieldCheck, Lock } from 'lucide-react';

const Payments = () => {
    const [methods, setMethods] = useState([
        { id: 1, type: 'Visa', last4: '4242', brand: 'visa', isDefault: true },
        { id: 2, type: 'Mastercard', last4: '8888', brand: 'mastercard', isDefault: false },
    ]);

    const removeMethod = (id) => {
        setMethods(methods.filter(m => m.id !== id));
    };

    return (
        <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black mb-2">Pagamenti</h2>
                        <p className="text-gray-400 text-sm">Gestisci i tuoi metodi di pagamento e le preferenze di fatturazione.</p>
                    </div>
                    <button className="bg-primary text-black font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95">
                        <Plus size={20} /> Aggiungi
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {methods.map((method) => (
                            <motion.div 
                                key={method.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <CreditCard size={40} className="text-white/5" />
                                </div>
                                
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-12 h-8 bg-white/10 rounded-md flex items-center justify-center font-bold italic text-xs">
                                        {method.type}
                                    </div>
                                    {method.isDefault && (
                                        <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase tracking-widest">
                                            Predefinito
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black mb-1">Numero Carta</p>
                                    <p className="text-xl font-mono tracking-widest">•••• •••• •••• {method.last4}</p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <button className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors">RENDI PREDEFINITO</button>
                                    <button onClick={() => removeMethod(method.id)} className="text-red-400/50 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex items-start gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-1 text-white">I tuoi dati sono al sicuro</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Utilizziamo crittografia di grado militare (AES-256) per proteggere le tue informazioni. I dati della carta non vengono mai salvati direttamente sui nostri server ma gestiti tramite partner certificati PCI-DSS.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payments;
