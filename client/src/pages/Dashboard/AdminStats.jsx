import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Star, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminStats = () => {
    const [data, setData] = useState({
        ratings: [],
        activity: [],
        visitors: 0,
        guestVisitors: 0,
        loggedVisitors: 0,
        totalTickets: 0,
        openTickets: 0,
        feedback: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, feedbackRes] = await Promise.all([
                    axios.get('/api/stats'),
                    axios.get('/api/feedback/recent')
                ]);
                
                setData({
                    ratings: statsRes.data.ratings || [],
                    activity: statsRes.data.activity || [],
                    visitors: statsRes.data.visitors || 0,
                    guestVisitors: statsRes.data.guestVisitors || 0,
                    loggedVisitors: statsRes.data.loggedVisitors || 0,
                    totalTickets: statsRes.data.totalTickets || 0,
                    openTickets: statsRes.data.openTickets || 0,
                    feedback: feedbackRes.data || []
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#4ade80', '#a3e635', '#facc15', '#fb923c', '#f87171'];

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '60vh', color: 'var(--text-dim)' }}>
                <p>Caricamento statistiche reali...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl flex-col gap-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold mb-2">Analytics Amministratore</h2>
                <p className="text-muted text-sm">Monitora le performance del supporto e il feedback degli utenti in tempo reale.</p>
            </motion.div>

            <div className="grid grid-cols-1 md-grid-cols-4 gap-6 mb-8">
                <div className="card text-center" style={{ padding: '1.5rem' }}>
                    <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Visitatori Totali</p>
                    <p className="text-2xl font-bold">{data.visitors}</p>
                </div>
                <div className="card text-center" style={{ padding: '1.5rem' }}>
                    <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Ospiti (Non Loggati)</p>
                    <p className="text-2xl font-bold" style={{ color: '#94a3b8' }}>{data.guestVisitors}</p>
                </div>
                <div className="card text-center" style={{ padding: '1.5rem' }}>
                    <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Utenti Loggati</p>
                    <p className="text-2xl font-bold" style={{ color: '#4ade80' }}>{data.loggedVisitors}</p>
                </div>
                <div className="card text-center" style={{ padding: '1.5rem' }}>
                    <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Ticket Aperti</p>
                    <p className="text-2xl font-bold" style={{ color: '#fb923c' }}>{data.openTickets}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md-grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                {/* Ratings Pie Chart */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <Star size={20} style={{ opacity: 0.5 }} /> Valutazioni Supporto
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.ratings}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.ratings.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0d0e1b', border: '1px solid var(--border-subtle)', borderRadius: '1rem', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', padding: '0 1rem' }}>
                        {data.ratings.map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                    <p className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{r.name.split(' ')[0]} Stelle</p>
                                </div>
                                <p className="text-sm font-bold">{r.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Area Chart */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <TrendingUp size={20} style={{ opacity: 0.5 }} /> Attività Ticket Settimanale
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.activity}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--text-dim)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="var(--text-dim)" fontSize={10} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                     contentStyle={{ backgroundColor: '#0d0e1b', border: '1px solid var(--border-subtle)', borderRadius: '1rem', fontSize: '12px' }}
                                     itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#ffffff" fillOpacity={1} fill="url(#colorTickets)" strokeWidth={2} dot={{ fill: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Feedback Table */}
            <div className="card">
                <h3 className="text-lg font-bold mb-6">Ultimi Feedback Ricevuti</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Utente</th>
                                <th className="text-center">Voto</th>
                                <th>Commento</th>
                                <th className="text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.feedback?.length > 0 ? (
                                data.feedback.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700 }}>
                                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                <img src={item.userId?.picture || '/favicon.png'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                                {item.userId?.name || 'Utente'}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                                {[...Array(5)].map((_, j) => (
                                                    <Star key={j} size={10} 
                                                        fill={j < item.rating ? 'white' : 'none'} 
                                                        stroke={j < item.rating ? 'white' : 'var(--text-dim)'} 
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-muted italic" style={{ fontSize: '0.75rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            "{item.feedbackComment}"
                                        </td>
                                        <td className="text-right text-dim text-xs">
                                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-dim" style={{ padding: '2rem' }}>Nessun feedback recente</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Danger Zone */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(239, 68, 68, 0.02)', borderRadius: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>Zona Pericolo</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', maxWidth: '500px' }}>
                            Resetta il database eliminando tutti i ticket e gli ordini. Le statistiche verranno ricalcolate. Questa azione è irreversibile.
                        </p>
                    </div>
                    <button 
                        onClick={async () => {
                            const conf = confirm('Sei sicuro di voler resettare il database? Tutti i ticket e gli ordini verranno eliminati.');
                            if (!conf) return;
                            const pass = prompt('Inserisci la password di conferma (admin-reset-confirm):');
                            if (!pass) return;
                            try {
                                const res = await axios.post('/api/admin/reset', { password: pass });
                                alert(res.data.message);
                                window.location.reload();
                            } catch (err) {
                                alert('Errore durante il reset: ' + (err.response?.data?.message || err.message));
                            }
                        }}
                        className="btn-primary" 
                        style={{ background: '#ef4444', color: 'white', width: 'auto', padding: '1rem 2rem' }}
                    >
                        Resetta Database
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminStats;
