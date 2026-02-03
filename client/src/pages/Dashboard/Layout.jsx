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
    Bell
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

    // Admin-specific items
    if (user.isAdmin) {
        navItems.push(
            { name: 'Analytics', path: '/dashboard/stats', icon: BarChart3, adminOnly: true },
            { name: 'Utenti', path: '/dashboard/users', icon: User, adminOnly: true },
            { name: 'Messaggi', path: '/dashboard/messages', icon: Bell, adminOnly: true }
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-['Inter']">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                className="bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col z-20 transition-all duration-300"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <h1 className="text-xl font-black tracking-tighter text-primary">M47G PLATFORM</h1>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-all ${
                                    isActive 
                                    ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={22} />
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isActive && isSidebarOpen && item.adminOnly && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">ADMIN</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                    >
                        <LogOut size={22} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <img src={user.picture || '/favicon.png'} alt="Profile" className="w-10 h-10 rounded-full border border-white/20" />
                        <div>
                            <p className="text-sm font-bold text-white">{user.name} {user.surname}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.isAdmin ? 'Administrator' : 'Platform User'}</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
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
                            </>
                        )}
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
