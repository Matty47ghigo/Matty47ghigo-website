import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import axios from 'axios';

const AdminStats = () => {
    const [data, setData] = useState({
        ratings: [
            { name: '5 Stelle', value: 12 },
            { name: '4 Stelle', value: 5 },
            { name: '3 Stelle', value: 2 },
            { name: '2 Stelle', value: 1 },
            { name: '1 Stella', value: 0 },
        ],
        activity: [
            { day: 'Lun', tickets: 4 },
            { day: 'Mar', tickets: 7 },
            { day: 'Mer', tickets: 5 },
            { day: 'Gio', tickets: 8 },
            { day: 'Ven', tickets: 12 },
            { day: 'Sab', tickets: 3 },
            { day: 'Dom', tickets: 2 },
        ]
    });

    const COLORS = ['#00e5ff', '#00e5ffcc', '#00e5ff99', '#00e5ff66', '#00e5ff33'];

    return (
        <div className="max-w-6xl space-y-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-black mb-2">Analytics Amministratore</h2>
                <p className="text-gray-400 text-sm">Monitora le performance del supporto e il feedback degli utenti.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ratings Pie Chart */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Star className="text-primary" /> Valutazioni Supporto
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.ratings}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.ratings.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                        {data.ratings.map((r, i) => (
                            <div key={i} className="text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{r.name}</p>
                                <p className="text-sm font-black">{r.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Area Chart */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary" /> Attività Ticket Settimanale
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.activity}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                     contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                     itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#00e5ff" fillOpacity={1} fill="url(#colorTickets)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Feedback Table */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold mb-6">Ultimi Feedback Ricevuti</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-4 text-xs font-black text-gray-500 uppercase tracking-widest">Utente</th>
                                <th className="pb-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Voto</th>
                                <th className="pb-4 text-xs font-black text-gray-500 uppercase tracking-widest">Commento</th>
                                <th className="pb-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1,2,3].map(i => (
                                <tr key={i} className="hover:bg-white/[0.02]">
                                    <td className="py-4 font-bold text-sm">Mario Rossi</td>
                                    <td className="py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={12} className={j < 4 ? 'text-primary fill-primary' : 'text-gray-700'} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-gray-400 italic">"Supporto velocissimo, risolto tutto in 5 minuti."</td>
                                    <td className="py-4 text-right text-xs text-gray-500">Oggi, 14:20</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
