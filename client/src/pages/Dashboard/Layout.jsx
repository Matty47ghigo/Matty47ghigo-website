import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    User, 
    CreditCard, 
    ShoppingCart, 
    LifeBuoy, 
    LogOut,
    Menu,
    X,
    Bell,
    BarChart3,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dashboard Sub-pages
import DashboardHome from './Home';
import Profile from './Profile';
import Payments from './Payments';
import Orders from './Orders';
import Support from './Support';
import Users from './Users'; // Only for admin
import Messages from './Messages'; // Only for admin
import AdminStats from './AdminStats';
import AdminDangerZone from './AdminDangerZone';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profilo', path: '/dashboard/profile', icon: User },
        { name: 'Pagamenti', path: '/dashboard/payments', icon: CreditCard },
        { name: 'Ordini', path: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Assistenza', path: '/dashboard/support', icon: LifeBuoy },
    ];

    if (user.isAdmin) {
        navItems.push(
            { name: 'Analytics', path: '/dashboard/stats', icon: BarChart3, adminOnly: true },
            { name: 'Utenti', path: '/dashboard/users', icon: User, adminOnly: true },
            { name: 'Danger Zone', path: '/dashboard/admin-danger', icon: ShieldAlert, adminOnly: true }
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                className="sidebar"
                style={{ transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
            >
                <div className="sidebar-header">
                    {isSidebarOpen && (
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'white' }}>Matty47ghigo</h1>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'white', 
                            cursor: 'pointer', 
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.5
                        }}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`sidebar-btn ${isActive ? 'sidebar-btn-active' : ''}`}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isActive && isSidebarOpen && item.adminOnly && (
                                    <span style={{ 
                                        marginLeft: 'auto', 
                                        background: '#ef4444', 
                                        color: 'white', 
                                        fontSize: '10px', 
                                        padding: '2px 8px', 
                                        borderRadius: '100px',
                                        fontWeight: 700
                                    }}>ADMIN</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button 
                        onClick={handleLogout}
                        className="sidebar-btn"
                        style={{ color: '#f87171' }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="main-container">
                <header className="main-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={user.picture || '/favicon.png'} alt="Profile" className="avatar" />
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.name} {user.surname}</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {user.isAdmin ? 'Administrator' : 'Platform User'}
                            </p>
                        </div>
                    </div>
                    <div style={{ opacity: 0.4 }}>
                        <Bell size={20} />
                    </div>
                </header>

                <div className="dashboard-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/support" element={<Support />} />
                        {user.isAdmin && (
                            <>
                                <Route path="/users" element={<Users />} />
                                <Route path="/messages" element={<Messages />} />
                                <Route path="/stats" element={<AdminStats />} />
                                <Route path="/admin-danger" element={<AdminDangerZone />} />
                            </>
                        )}
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
