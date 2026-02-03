import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Clock, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([
        { 
            id: 'ORD-7721', 
            status: 'consegnato', 
            total: 129.00, 
            date: '2026-01-15', 
            items: [{ name: 'Sviluppo Bot Telegram Custom', price: 129, img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop' }] 
        },
        { 
            id: 'ORD-8102', 
            status: 'contabilizzare', 
            total: 450.00, 
            date: '2026-02-01', 
            items: [{ name: 'Setup Server MongoDB Atlas', price: 450, img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=100&h=100&fit=crop' }] 
        },
    ]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'consegnato': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'contabilizzare': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black mb-2">I miei Ordini</h2>
                    <p className="text-gray-400 text-sm">Visualizza la cronologia dei tuoi acquisti e lo stato dei lavori.</p>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {orders.map((order, i) => (
                            <motion.div 
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                                    <img src={order.items[0].img} alt="Order" className="w-full h-full object-cover opacity-50" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">{order.id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{order.items[0].name}</h4>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {order.date}</span>
                                        <span className="flex items-center gap-1"><CheckCircle size={14} /> Fatturato</span>
                                    </div>
                                </div>

                                <div className="text-right flex items-center gap-6">
                                    <div className="hidden md:block">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Totale</p>
                                        <p className="text-xl font-black text-white">€{order.total.toFixed(2)}</p>
                                    </div>
                                    <button className="p-3 bg-white/5 hover:bg-primary hover:text-black rounded-xl transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ShoppingCart size={32} className="text-gray-500 group-hover:text-primary" />
                    </div>
                    <p className="text-gray-500 font-bold group-hover:text-white">Sfogliate i nostri servizi</p>
                    <p className="text-xs text-gray-600 mt-2">Nuovi pacchetti disponibili ogni mese.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Orders;
