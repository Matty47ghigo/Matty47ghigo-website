import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, 
    RefreshCw, 
    Pickaxe, 
    Bot, 
    MessageSquare, 
    Database, 
    Server, 
    Cloud, 
    Settings, 
    UserCheck, 
    ChevronDown,
    ShoppingCart,
    Check,
    ArrowRight,
    User,
    LogOut,
    X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Button colors by category
const categoryColors = {
    'web-editing': { bg: '#00e5ff', text: '#000000' }, // Azure for web editing
    'bot': { bg: '#7289da', text: '#ffffff' }, // Blu for bots
    'settaggi': { bg: '#00ff88', text: '#000000' }, // Green for settings
    'server': { bg: '#ff6b35', text: '#ffffff' }, // Orange for servers
    'consulenze': { bg: '#ffd700', text: '#000000' } // Yellow for consultations
};

// Product images based on keywords
const getProductImage = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('minecraft')) return '/assets/images/minecraft.png';
    if (titleLower.includes('database')) return '/assets/images/database.png';
    if (titleLower.includes('discord')) return '/assets/images/discord.png';
    if (titleLower.includes('telegram')) return '/assets/images/telegram.png';
    if (titleLower.includes('web') || titleLower.includes('sitoweb') || titleLower.includes('server web')) return '/assets/images/website.png';
    if (titleLower.includes('vps') || titleLower.includes('hosting') || (titleLower.includes('server') && !titleLower.includes('discord'))) return '/assets/images/server-hosting.png';
    return null;
};

// Stripe Product IDs mapping
const stripeProductIds = {
    'bot-discord': 'prod_TxJLgG8u6gOXVl',
    'server-minecraft': 'prod_TxJZgPPMJHhD2E',
    'creazione-sito-web': 'prod_TxKASZ3SqSvFOG',
    'modernizzazione-sito': 'prod_TxKLQMN3iuKucA',
    'sitoweb-minecraft-rp': 'prod_TxYg8spO4vwmVI',
    'bot-telegram': 'prod_TxYlqDUAbTUuGd',
    'bot-minecraft': 'prod_TxYqpHY3ojlH2k',
    'setup-database': 'prod_TxYuKUIUEGCAXH',
    'setup-discord-server': 'prod_TxYxrsqhhJo0lj',
    'setup-vps': 'prod_TxYzCoXk6w2cRG',
    'setup-web-server': 'prod_TxZ0ryWZ8wBljO',
    'setup-minecraft-server': 'prod_TxZ3WeqEVB7ckO',
    'server-discord': 'prod_TxZ7CKfYILe668'
};

const categories = [
    { id: 'web-editing', name: 'Web Editing', icon: <Globe size={24} />, color: '#00e5ff' },
    { id: 'bot', name: 'Bot', icon: <Bot size={24} />, color: '#7289da' },
    { id: 'settaggi', name: 'Settaggi', icon: <Settings size={24} />, color: '#00ff88' },
    { id: 'server', name: 'Server', icon: <Server size={24} />, color: '#ff6b35' },
    { id: 'consulenze', name: 'Consulenze Tecniche', icon: <UserCheck size={24} />, color: '#ffd700' }
];

const products = {
    'web-editing': [
        {
            id: 'creazione-sito-web',
            title: 'Creazione Sito Web',
            description: 'Sito web moderno e responsivo creato da zero secondo le tue esigenze. Include design personalizzato, ottimizzazione SEO e hosting iniziale.',
            price: 299,
            priceDisplay: 'Da €299',
            features: ['Design personalizzato', 'Responsivo (mobile-friendly)', 'Ottimizzazione SEO base', 'Contatti email inclusi', '1 mese di supporto'],
            stripeId: stripeProductIds['creazione-sito-web']
        },
        {
            id: 'modernizzazione-sito',
            title: 'Modernizzazione Sito Web',
            description: 'Rinnovo completo del tuo sito esistente con design moderno, miglioramento delle performance e aggiornamento tecnologico.',
            price: 149,
            priceDisplay: 'Da €149',
            features: ['Restyling grafico', 'Miglioramento performance', 'Ottimizzazione mobile', 'Aggiornamento contenuti', '6 mesi di manutenzione'],
            stripeId: stripeProductIds['modernizzazione-sito']
        },
        {
            id: 'sitoweb-minecraft-rp',
            title: 'Sito Web per Minecraft/Roleplay',
            description: 'Sito web dedicato a server Minecraft o community roleplay con sistema autenticazione, store, forum e status del server.',
            price: 199,
            priceDisplay: 'Da €199',
            features: ['Sistema autenticazione', 'Store integrato', 'Status server live', 'Forum community', 'Patchnotes automatiche'],
            stripeId: stripeProductIds['sitoweb-minecraft-rp']
        }
    ],
    'bot': [
        {
            id: 'bot-discord',
            title: 'Bot Discord Personalizzato',
            description: 'Bot Discord su misura per le tue esigenze con comandi personalizzati, automazioni, moderazione e integrazioni.',
            price: 49,
            priceDisplay: 'Da €49',
            features: ['Comandi personalizzati', 'Sistema moderazione', 'Logging avanzato', 'Integrazione API', 'Hosting incluso 1 mese'],
            stripeId: stripeProductIds['bot-discord']
        },
        {
            id: 'bot-telegram',
            title: 'Bot Telegram',
            description: 'Bot Telegram per automazione, gestione community, notifiche e molto altro.',
            price: 39,
            priceDisplay: 'Da €39',
            features: ['Comandi personalizzati', 'Notifiche automatiche', 'Gestione gruppi', 'Webhook integrations', 'Hosting incluso 1 mese'],
            stripeId: stripeProductIds['bot-telegram']
        },
        {
            id: 'bot-minecraft',
            title: 'Plugin/Mod Discord-MC',
            description: 'Bridge e plugin per collegare il tuo server Minecraft con Discord per chat cross-platform.',
            price: 29,
            priceDisplay: 'Da €29',
            features: ['Chat sincronizzata', 'Rich presence', 'Notifiche eventi', 'Kill/death tracker', 'Compatibile with Spigot/Paper'],
            stripeId: stripeProductIds['bot-minecraft']
        }
    ],
    'settaggi': [
        {
            id: 'setup-database',
            title: 'Configurazione Database',
            description: 'Setup completo di database MySQL, PostgreSQL o MongoDB ottimizzato per le tue applicazioni.',
            price: 29,
            priceDisplay: 'Da €29',
            features: ['Installazione e configurazione', 'Ottimizzazione query', 'Backup automatizzati', 'Sicurezza avanzata', 'Documentazione'],
            stripeId: stripeProductIds['setup-database']
        },
        {
            id: 'setup-discord-server',
            title: 'Setup Discord Server',
            description: 'Configurazione completa del tuo server Discord con canali, ruoli, bot e automazioni.',
            price: 49,
            priceDisplay: 'Da €49',
            features: ['Struttura canali personalizzata', 'Sistema ruoli', 'Widget server', 'Vanity URL', 'Server banner professionale'],
            stripeId: stripeProductIds['setup-discord-server']
        },
        {
            id: 'setup-vps',
            title: 'Configurazione VPS',
            description: 'Setup e ottimizzazione VPS per hosting di applicazioni web, bot, game server e molto altro.',
            price: 59,
            priceDisplay: 'Da €59',
            features: ['Installazione SO', 'Configurazione firewall', 'SSL/HTTPS', 'Reverse proxy (Nginx)', 'Performance tuning'],
            stripeId: stripeProductIds['setup-vps']
        },
        {
            id: 'setup-web-server',
            title: 'Setup Web Server',
            description: 'Configurazione web server Nginx o Apache con ottimizzazioni per alte performance e sicurezza.',
            price: 49,
            priceDisplay: 'Da €49',
            features: ['Server web ottimizzato', 'Configurazione SSL', 'Cache avanzata', 'Protezione DDoS base', 'Monitoraggio'],
            stripeId: stripeProductIds['setup-web-server']
        },
        {
            id: 'setup-minecraft-server',
            title: 'Setup Minecraft Server',
            description: 'Configurazione e ottimizzazione server Minecraft per performance ottimali e migliore esperienza di gioco.',
            price: 39,
            priceDisplay: 'Da €39',
            features: ['Paper/Spigot setup', 'Ottimizzazione performance', 'Plugins essenziali', 'Backup automatici', 'Anti-lag tuning'],
            stripeId: stripeProductIds['setup-minecraft-server']
        }
    ],
    'server': [
        {
            id: 'server-minecraft',
            title: 'Minecraft Server Hosting',
            description: 'Hosting server Minecraft con hardware dedicato, uptime garantito e supporto tecnico specializzato.',
            price: 5,
            priceDisplay: '€5-25/mese',
            isSubscription: true,
            features: ['Hardware dedicato', 'DDoS protection', 'Backup giornalieri', 'Slot espandibili', 'Supporto 24/7'],
            plans: [
                { name: 'Basic', slots: 10, price: 5 },
                { name: 'Standard', slots: 25, price: 10 },
                { name: 'Premium', slots: 50, price: 20 },
                { name: 'Ultimate', slots: 100, price: 25 }
            ],
            stripeId: stripeProductIds['server-minecraft']
        },
        {
            id: 'server-discord',
            title: 'Discord Server Setup Pro',
            description: 'Servizio completo di setup e gestione server Discord professionale per community grandi.',
            price: 79,
            priceDisplay: 'Da €79',
            features: ['Design premium server', 'Bot personalizzati', 'Widget avanzati', 'Analytics community', '1 mese gestione inclusa'],
            stripeId: stripeProductIds['server-discord']
        }
    ],
    'consulenze': [
        {
            id: 'consulenza-sviluppo',
            title: 'Consulenza Sviluppo Software',
            description: 'Sessione di consulenza per progettazione software, architettura applicativa e best practices di sviluppo.',
            price: 30,
            priceDisplay: '€30/ora',
            features: ['Analisi requisiti', 'Progettazione architettura', 'Code review', 'Consigli ottimizzazione', 'Documentazione tecnica']
        },
        {
            id: 'consulenza-infra',
            title: 'Consulenza Infrastruttura IT',
            description: 'Consulenza su infrastrutture IT, server, cloud e sicurezza informatica per aziende e privati.',
            price: 40,
            priceDisplay: '€40/ora',
            features: ['Analisi infrastruttura', 'Piano migrazione cloud', 'Sicurezza informatica', 'Cost optimization', 'Report dettagliato']
        },
        {
            id: 'consulenza-gaming',
            title: 'Consulenza Gaming Community',
            description: 'Consulenza per community gaming su setup server, moderazione, engagement e monetizzazione.',
            price: 25,
            priceDisplay: '€25/ora',
            features: ['Strategia community', 'Setup tecnico', 'Monetizzazione', 'Event planning', 'Growth strategy']
        }
    ]
};

const Shop = () => {
    const navigate = useNavigate();
    const { addToCart, getItemCount, clearCart } = useCart();
    
    const [activeCategory, setActiveCategory] = useState('web-editing');
    const [expandedProducts, setExpandedProducts] = useState({});
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({});
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [addingToCart, setAddingToCart] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Load user from localStorage on mount and listen for changes
    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing user:', e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        
        loadUser();
        window.addEventListener('storage', loadUser);
        const interval = setInterval(loadUser, 1000);
        
        return () => {
            window.removeEventListener('storage', loadUser);
            clearInterval(interval);
        };
    }, []);

    const toggleProduct = (id) => {
        setExpandedProducts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setShowUserMenu(false);
        navigate('/');
    };

    const showNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAddToCart = async (product) => {
        setAddingToCart(product.id);
        
        let finalPrice = product.price;
        let billingPeriod = selectedPeriod;
        
        if (product.plans) {
            const plan = selectedPlan[product.id];
            if (!plan) {
                showNotification('Seleziona un piano!');
                setAddingToCart(null);
                return;
            }
            
            finalPrice = billingPeriod === 'year' ? plan.price * 10 : plan.price;
            
            addToCart({
                ...product,
                price: finalPrice,
                options: {
                    plan: plan.name,
                    slots: plan.slots,
                    billingPeriod: billingPeriod
                }
            });
            showNotification(`${product.title} (${plan.name}) aggiunto al carrello!`);
        } else if (product.isSubscription) {
            finalPrice = billingPeriod === 'year' ? product.price * 10 : product.price;
            addToCart({
                ...product,
                price: finalPrice,
                options: {
                    billingPeriod: billingPeriod
                }
            });
            showNotification(`${product.title} aggiunto al carrello!`);
        } else {
            addToCart({
                ...product,
                price: finalPrice
            });
            showNotification(`${product.title} aggiunto al carrello!`);
        }
        
        setAddingToCart(null);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const activeProducts = products[activeCategory] || [];
    const categoryColor = categoryColors[activeCategory] || categoryColors['web-editing'];

    return (
        <div style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', color: 'white', position: 'relative' }}>
            {/* Background Effects */}
            <div className="bg-noise" />
            <div className="top-glow" />
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                opacity: 0.03, 
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                zIndex: 0
            }} />

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        style={{
                            position: 'fixed',
                            top: '100px',
                            right: '20px',
                            padding: '1rem 1.5rem',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            borderRadius: '1rem',
                            color: 'white',
                            fontWeight: 600,
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        <Check size={20} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navbar */}
            <nav 
                className="liquid-glass"
                style={{ 
                    position: 'fixed', 
                    top: '1.5rem', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: '90%', 
                    maxWidth: '1400px',
                    padding: '1rem 2.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    zIndex: 100,
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.2) 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black'
                    }}>
                        <Server size={22} />
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase', color: 'white' }}>
                        matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
                    </div>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Cart Icon */}
                    <Link 
                        to="/cart"
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '50%',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <ShoppingCart size={20} />
                        {getItemCount() > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: 'var(--accent)',
                                color: 'black',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {getItemCount()}
                            </span>
                        )}
                    </Link>

                    {/* User Menu or Login */}
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.5rem 1rem 0.5rem 0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '100px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <img 
                                    src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=00e5ff&color=000`}
                                    alt={user.name}
                                    referrerPolicy="no-referrer"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=00e5ff&color=000`;
                                    }}
                                />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {user.name?.split(' ')[0]}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 0.5rem)',
                                            right: 0,
                                            background: 'var(--bg-black)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '1rem',
                                            padding: '0.5rem',
                                            minWidth: '200px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <Link 
                                            to="/dashboard"
                                            onClick={() => setShowUserMenu(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem 1rem',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '0.5rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <User size={18} />
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link 
                                            to="/dashboard/orders"
                                            onClick={() => setShowUserMenu(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem 1rem',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '0.5rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <ShoppingCart size={18} />
                                            <span>I miei Ordini</span>
                                        </Link>
                                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem 1rem',
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                borderRadius: '0.5rem',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link 
                            to="/login"
                            className="btn-primary"
                            style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', width: 'auto', fontSize: '0.8rem' }}
                        >
                            <User size={16} style={{ marginRight: '0.5rem' }} />
                            Accedi
                        </Link>
                    )}
                </div>
            </nav>

            {/* Header Section */}
            <section style={{ paddingTop: '140px', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <h1 className="title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1.5rem' }}>
                            Service <span className="text-gradient">Shop</span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                            Scopri tutti i nostri servizi e soluzioni tecniche. Dallo sviluppo web ai bot Discord, 
                            dalla configurazione server alle consulenze tecniche specializzate.
                        </p>
                    </motion.div>

                    {/* Category Navigation */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center',
                        marginBottom: '3rem'
                    }}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem 1.5rem',
                                    background: activeCategory === cat.id ? `${cat.color}15` : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${activeCategory === cat.id ? cat.color : 'var(--border-subtle)'}`,
                                    borderRadius: '100px',
                                    color: activeCategory === cat.id ? cat.color : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {cat.icon}
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section style={{ paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                            gap: '1.5rem'
                        }}
                    >
                        {activeProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="card"
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Hover Glow Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: categories.find(c => c.id === activeCategory)?.color || '#00e5ff'
                                }} />

                                {/* Product Image if available */}
                                {getProductImage(product.title) && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}>
                                        <img 
                                            src={getProductImage(product.title)}
                                            alt={product.title}
                                            style={{
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            {product.title}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                            {product.description}
                                        </p>
                                    </div>
                                    <div style={{ 
                                        padding: '0.5rem 1rem', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '50px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: 'var(--accent)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.priceDisplay}
                                    </div>
                                </div>

                                {/* Billing Period Selection (for subscription products) */}
                                {product.isSubscription && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '0.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '50px',
                                            padding: '0.25rem'
                                        }}>
                                            <button
                                                onClick={() => setSelectedPeriod('month')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '50px',
                                                    border: 'none',
                                                    background: selectedPeriod === 'month' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Mensile
                                            </button>
                                            <button
                                                onClick={() => setSelectedPeriod('year')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '50px',
                                                    border: 'none',
                                                    background: selectedPeriod === 'year' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Annuale
                                            </button>
                                        </div>
                                        {selectedPeriod === 'year' && (
                                            <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem', textAlign: 'center' }}>
                                                Risparmia -17%! (10 mesi invece di 12)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Plans Selection (if available) */}
                                {product.plans && (
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(4, 1fr)', 
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {product.plans.map((plan, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedPlan(prev => ({
                                                    ...prev,
                                                    [product.id]: plan
                                                }))}
                                                style={{
                                                    padding: '0.75rem 0.5rem',
                                                    background: selectedPlan[product.id]?.name === plan.name 
                                                        ? `${categoryColor.bg}1a` // 10% opacity
                                                        : 'rgba(255,255,255,0.03)',
                                                    border: selectedPlan[product.id]?.name === plan.name 
                                                        ? `2px solid ${categoryColor.bg}` 
                                                        : '1px solid var(--border-subtle)',
                                                    borderRadius: '0.75rem',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                                                    {plan.name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {plan.slots} slot
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                                                    €{selectedPeriod === 'year' ? plan.price * 10 : plan.price}/{selectedPeriod === 'year' ? 'anno' : 'm'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Expandable Features */}
                                <div style={{ 
                                    marginTop: '1.5rem',
                                    paddingTop: '1.5rem',
                                    borderTop: '1px solid var(--border-subtle)'
                                }}>
                                    <button
                                        onClick={() => toggleProduct(product.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-dim)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            padding: 0
                                        }}
                                    >
                                        <ChevronDown 
                                            size={16}
                                            style={{
                                                transform: expandedProducts[product.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                        {expandedProducts[product.id] ? 'Nascondi dettagli' : 'Mostra dettagli'}
                                    </button>

                                    <AnimatePresence>
                                        {expandedProducts[product.id] && (
                                            <motion.ul
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{
                                                    listStyle: 'none',
                                                    padding: 0,
                                                    marginTop: '1rem'
                                                }}
                                            >
                                                {product.features.map((feature, i) => (
                                                    <li
                                                        key={i}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.85rem',
                                                            color: 'var(--text-muted)',
                                                            marginBottom: '0.5rem'
                                                        }}
                                                    >
                                                        <Check size={14} style={{ color: categoryColor.bg }} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Add to Cart Button with Category Colors */}
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={addingToCart === product.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginTop: '1.5rem',
                                        padding: '0.875rem 1.5rem',
                                        background: addingToCart === product.id 
                                            ? 'rgba(255,255,255,0.1)' 
                                            : categoryColor.bg,
                                        border: 'none',
                                        borderRadius: '100px',
                                        color: addingToCart === product.id ? 'var(--text-dim)' : categoryColor.text,
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        cursor: addingToCart === product.id ? 'default' : 'pointer',
                                        width: '100%',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (addingToCart !== product.id) {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.filter = 'brightness(1.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.filter = 'brightness(1)';
                                    }}
                                >
                                    {addingToCart === product.id ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <RefreshCw size={18} />
                                            </motion.div>
                                            Aggiunta...
                                        </span>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            Aggiungi al Carrello
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ 
                padding: '4rem 1.5rem', 
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.05) 100%)',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ 
                    maxWidth: '800px', 
                    margin: '0 auto', 
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Non trovi quello che cerchi?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                        Contattaci per richieste personalizzate o per discutere il tuo progetto specifico.
                        Saremo felici di aiutarti a trovare la soluzione perfetta.
                    </p>
                    <Link 
                        to="/dashboard/support"
                        className="btn-primary"
                        style={{ 
                            padding: '1rem 2.5rem',
                            width: 'auto',
                            display: 'inline-flex'
                        }}
                    >
                        Contattaci
                        <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ 
                padding: '3rem 1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © 2025 Matty47ghigo Studios. Tutti i diritti riservati.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>Privacy</Link>
                    <Link to="/refund" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>Reso</Link>
                    <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>Termini</Link>
                </div>
            </footer>
        </div>
    );
};

export default Shop;
