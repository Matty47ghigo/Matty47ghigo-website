import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, ShoppingCart, User, MessageSquare, LogOut } from 'lucide-react';
import DashboardHome from './Home';
import Orders from './Orders';
import Users from './Users';
import Messages from './Messages';

const Layout = () => {
    const location = useLocation();

    // Simple active link styling helper
    const getLinkStyle = (path) => {
        // Handle exact match for root dashboard path
        const isMatch = location.pathname === `/dashboard${path}` || (path === '' && location.pathname === '/dashboard');
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 15px',
            margin: '5px 0',
            borderRadius: '5px',
            color: isMatch ? '#000' : '#fff',
            backgroundColor: isMatch ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.3s'
        };
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Main Content Area (Left) */}
            <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<Users />} />
                        <Route path="messages" element={<Messages />} />
                    </Routes>
                </div>

                {/* Footer in Main Content */}
                <footer style={{ 
                    marginTop: 'auto', 
                    paddingTop: '2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    borderTop: '1px solid #333',
                    color: '#888'
                }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        2025 &copy; Tutti i diritti riservati <strong>Matty47ghigo</strong>
                    </p>
                    <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                        Matty47ghigo Studios - Sito fatto con il ❤️
                    </p>
                </footer>
            </main>

            {/* Sidebar (Right) */}
            <aside style={{ 
                width: '280px', 
                backgroundColor: 'var(--sidebar-bg)', 
                borderLeft: '1px solid #333', 
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)' }}>Dashboard</h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/dashboard" style={getLinkStyle('')}>
                        <HomeIcon size={20} /> Home
                    </Link>
                    <Link to="/dashboard/orders" style={getLinkStyle('/orders')}>
                        <ShoppingCart size={20} /> Carrello / Ordini
                    </Link>
                    <Link to="/dashboard/users" style={getLinkStyle('/users')}>
                        <User size={20} /> Utenti
                    </Link>
                    <Link to="/dashboard/messages" style={getLinkStyle('/messages')}>
                        <MessageSquare size={20} /> Messaggi
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                     <Link to="/" style={{ ...getLinkStyle(''), color: '#f44336' }}>
                        <LogOut size={20} /> Esci
                    </Link>
                </div>
            </aside>
        </div>
    );
};

export default Layout;
