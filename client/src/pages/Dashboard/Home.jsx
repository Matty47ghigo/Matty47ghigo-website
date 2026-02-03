import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, LifeBuoy, CreditCard, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Home = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState({ visitors: 0, registeredUsers: 0, orders: 0 });

    useEffect(() => {
        axios.get('http://localhost:3001/api/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    const cards = [
        { title: 'I tuoi Ordini', value: stats.orders, icon: ShoppingCart, color: 'text-primary' },
        { title: 'Ticket Aperti', value: 0, icon: LifeBuoy, color: 'text-orange-400' },
        { title: 'Metodi Pagamento', value: 0, icon: CreditCard, color: 'text-purple-400' },
    ];

    return (
        <div className="max-w-6xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h2 className="text-4xl font-black mb-2">Ciao {user.name},</h2>
                <p className="text-xl text-gray-400">Cosa vuoi fare oggi?</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {cards.map((card, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group"
                    >
                        <card.icon className={`mb-6 ${card.color}`} size={32} />
                        <p className="text-gray-400 font-semibold mb-2">{card.title}</p>
                        <p className="text-3xl font-black mb-4">{card.value}</p>
                        <button className="flex items-center gap-2 text-sm text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Gestisci <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6">Attività Recente</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Ordine completato</p>
                                <p className="text-xs text-gray-400">2 ore fa</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center py-4">Nessuna altra attività recente</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                    <LifeBuoy size={48} className="text-primary/50 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Hai bisogno di aiuto?</h3>
                    <p className="text-sm text-gray-400 mb-6">I nostri esperti sono pronti ad aiutarti in qualsiasi momento.</p>
                    <button className="bg-primary text-black font-bold py-3 px-8 rounded-2xl hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all">
                        Apri un Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
