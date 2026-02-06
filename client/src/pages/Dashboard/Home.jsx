import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, LifeBuoy, CreditCard, ArrowRight, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState({ visitors: 0, registeredUsers: 0, orders: 0 });
    const [userStats, setUserStats] = useState({ orders: 0, tickets: 0, payments: 0 });

    useEffect(() => {
        axios.get('/api/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
            
        if (user._id) {
            axios.get(`/api/users/${user._id}/stats`)
                .then(res => setUserStats(res.data))
                .catch(err => console.error(err));
        }
    }, [user._id]);

    const cards = user.isAdmin ? [
        { title: 'Visitatori Totali', value: stats.visitors, icon: User, color: 'white', link: '/dashboard/stats' }, // Linking to analytics
        { title: 'Utenti Registrati', value: stats.registeredUsers, icon: User, color: '#4ade80', link: '/dashboard/users' },
        { title: 'Ticket Aperti', value: stats.openTickets || 0, icon: LifeBuoy, color: '#fb923c', link: '/dashboard/support' },
    ] : [
        { title: 'I tuoi Ordini', value: userStats.orders, icon: ShoppingCart, color: 'white', link: '/dashboard/orders' },
        { title: 'Ticket Aperti', value: userStats.tickets, icon: LifeBuoy, color: '#fb923c', link: '/dashboard/support' },
        { title: 'Metodi Pagamento', value: userStats.payments, icon: CreditCard, color: '#c084fc', link: '/dashboard/payments' },
    ];

    return (
        <div style={{ maxWidth: '1152px' }}>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h2 className="text-4xl font-bold mb-2">Ciao {user.name},</h2>
                <p className="text-xl text-muted">Cosa vuoi fare oggi?</p>
            </motion.div>

            <div className="grid grid-cols-1 md-grid-cols-3 gap-6 mb-12">
                {cards.map((card, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                        style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                        onClick={() => navigate(card.link)}
                    >
                        <card.icon style={{ color: card.color, marginBottom: '1.5rem', opacity: 0.8 }} size={32} />
                        <p className="text-muted font-bold mb-2 text-xs uppercase tracking-widest">{card.title}</p>
                        <p className="text-3xl font-bold mb-4">{card.value}</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(card.link); }}
                            className="btn-primary" 
                            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            Gestisci <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Attività Recente</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p className="text-xs text-dim" style={{ textAlign: 'center', padding: '2rem 0' }}>Nessuna attività recente. Le tue azioni appariranno qui.</p>
                    </div>
                </div>

                <div className="card flex-col" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    <LifeBuoy size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 className="text-lg font-bold mb-2">Hai bisogno di aiuto?</h3>
                    <p className="text-sm text-muted mb-6">I nostri esperti sono pronti ad aiutarti in qualsiasi momento.</p>
                    <button 
                        onClick={() => navigate('/dashboard/support')}
                        className="btn-primary" 
                        style={{ width: 'fit-content', paddingLeft: '2rem', paddingRight: '2rem', margin: '0 auto' }}
                    >
                        Apri un Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
