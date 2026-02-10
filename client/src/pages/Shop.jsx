import React, { useState } from 'react';
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
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
            price: 'Da €299',
            features: ['Design personalizzato', 'Responsivo (mobile-friendly)', 'Ottimizzazione SEO base', 'Contatti email inclusi', '1 mese di supporto']
        },
        {
            id: 'modernizzazione-sito',
            title: 'Modernizzazione Sito Web',
            description: 'Rinnovo completo del tuo sito esistente con design moderno, miglioramento delle performance e aggiornamento tecnologico.',
            price: 'Da €149',
            features: ['Restyling grafico', 'Miglioramento performance', 'Ottimizzazione mobile', 'Aggiornamento contenuti', '6 mesi di manutenzione']
        },
        {
            id: 'sitoweb-minecraft-rp',
            title: 'Sito Web per Minecraft/Roleplay',
            description: 'Sito web dedicato a server Minecraft o community roleplay con sistema autenticazione, store, forum e status del server.',
            price: 'Da €199',
            features: ['Sistema autenticazione', 'Store integrato', 'Status server live', 'Forum community', 'Patchnotes automatiche']
        }
    ],
    'bot': [
        {
            id: 'bot-discord',
            title: 'Bot Discord Personalizzato',
            description: 'Bot Discord su misura per le tue esigenze con comandi personalizzati, automazioni, moderazione e integrazioni.',
            price: 'Da €49',
            features: ['Comandi personalizzati', 'Sistema moderazione', 'Logging avanzato', 'Integrazione API', 'Hosting incluso 1 mese']
        },
        {
            id: 'bot-telegram',
            title: 'Bot Telegram',
            description: 'Bot Telegram per automazione, gestione community, notifiche e molto altro.',
            price: 'Da €39',
            features: ['Comandi personalizzati', 'Notifiche automatiche', 'Gestione gruppi', 'Webhook integrations', 'Hosting incluso 1 mese']
        },
        {
            id: 'bot-minecraft',
            title: 'Plugin/Mod Discord-MC',
            description: 'Bridge e plugin per collegare il tuo server Minecraft con Discord per chat cross-platform.',
            price: 'Da €29',
            features: ['Chat sincronizzata', 'Rich presence', 'Notifiche eventi', 'Kill/death tracker', 'Compattibile with Spigot/Paper']
        }
    ],
    'settaggi': [
        {
            id: 'setup-database',
            title: 'Configurazione Database',
            description: 'Setup completo di database MySQL, PostgreSQL o MongoDB ottimizzato per le tue applicazioni.',
            price: 'Da €29',
            features: ['Installazione e configurazione', 'Ottimizzazione query', 'Backup automatizzati', 'Sicurezza avanzata', 'Documentazione']
        },
        {
            id: 'setup-discord-server',
            title: 'Setup Discord Server',
            description: 'Configurazione completa del tuo server Discord con canali, ruoli, bot e automazioni.',
            price: 'Da €49',
            features: ['Struttura canali personalizzata', 'Sistema ruoli', 'Widget server', 'Vanity URL', 'Server banner professionale']
        },
        {
            id: 'setup-vps',
            title: 'Configurazione VPS',
            description: 'Setup e ottimizzazione VPS per hosting di applicazioni web, bot, game server e molto altro.',
            price: 'Da €59',
            features: ['Installazione SO', 'Configurazione firewall', 'SSL/HTTPS', 'Reverse proxy (Nginx)', 'Performance tuning']
        },
        {
            id: 'setup-web-server',
            title: 'Setup Web Server',
            description: 'Configurazione web server Nginx o Apache con ottimizzazioni per alte performance e sicurezza.',
            price: 'Da €49',
            features: ['Server web ottimizzato', 'Configurazione SSL', 'Cache avanzata', 'Protezione DDoS base', 'Monitoraggio']
        },
        {
            id: 'setup-minecraft-server',
            title: 'Setup Minecraft Server',
            description: 'Configurazione e ottimizzazione server Minecraft per performance ottimali e migliore esperienza di gioco.',
            price: 'Da €39',
            features: ['Paper/Spigot setup', 'Ottimizzazione performance', 'Plugins essenziali', 'Backup automatici', 'Anti-lag tuning']
        }
    ],
    'server': [
        {
            id: 'server-minecraft',
            title: 'Minecraft Server Hosting',
            description: 'Hosting server Minecraft con hardware dedicato, uptime garantito e supporto tecnico specializzato.',
            price: '€5-25/mes',
            features: ['Hardware dedicato', 'DDoS protection', 'Backup giornalieri', 'Slot espandibili', 'Supporto 24/7'],
            plans: [
                { name: 'Basic', slots: 10, price: '€5/mes' },
                { name: 'Standard', slots: 25, price: '€10/mes' },
                { name: 'Premium', slots: 50, price: '€20/mes' },
                { name: 'Ultimate', slots: 100, price: '€25/mes' }
            ]
        },
        {
            id: 'server-discord',
            title: 'Discord Server Setup Pro',
            description: 'Servizio completo di setup e gestione server Discord professionale per community grandi.',
            price: 'Da €79',
            features: ['Design premium server', 'Bot personalizzati', 'Widget avanzati', 'Analytics community', '1 mese gestione inclusa']
        }
    ],
    'consulenze': [
        {
            id: 'consulenza-sviluppo',
            title: 'Consulenza Sviluppo Software',
            description: 'Sessione di consulenza per progettazione software, architettura applicativa e best practices di sviluppo.',
            price: '€30/ora',
            features: ['Analisi requisiti', 'Progettazione architettura', 'Code review', 'Consigli ottimizzazione', 'Documentazione tecnica']
        },
        {
            id: 'consulenza-infra',
            title: 'Consulenza Infrastruttura IT',
            description: 'Consulenza su infrastrutture IT, server, cloud e sicurezza informatica per aziende e privati.',
            price: '€40/ora',
            features: ['Analisi infrastruttura', 'Piano migrazione cloud', 'Sicurezza informatica', 'Cost optimization', 'Report dettagliato']
        },
        {
            id: 'consulenza-gaming',
            title: 'Consulenza Gaming Community',
            description: 'Consulenza per community gaming su setup server, moderazione, engagement e monetizzazione.',
            price: '€25/ora',
            features: ['Strategia community', 'Setup tecnico', 'Monetizzazione', 'Event planning', 'Growth strategy']
        }
    ]
};

const Shop = () => {
    const [activeCategory, setActiveCategory] = useState('web-editing');
    const [expandedProducts, setExpandedProducts] = useState({});

    const toggleProduct = (id) => {
        setExpandedProducts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const activeProducts = products[activeCategory] || [];

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
                
                <Link 
                    to="/login" 
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', width: 'auto', fontSize: '0.8rem' }}
                >
                    Accedi
                </Link>
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
                                        {product.price}
                                    </div>
                                </div>

                                {/* Plans (if available) */}
                                {product.plans && (
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(4, 1fr)', 
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {product.plans.map((plan, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: '0.75rem 0.5rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '0.75rem',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                                                    {plan.name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {plan.slots} slot
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                                                    {plan.price}
                                                </div>
                                            </div>
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
                                                        <Check size={14} style={{ color: 'var(--accent)' }} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    to="/login"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginTop: '1.5rem',
                                        padding: '0.875rem 1.5rem',
                                        background: 'linear-gradient(135deg, var(--accent) 0%, rgba(0,229,255,0.7) 100%)',
                                        border: 'none',
                                        borderRadius: '100px',
                                        color: 'black',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <ShoppingCart size={18} />
                                    Acquista Ora
                                    <ArrowRight size={16} />
                                </Link>
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
                        Contattaci per una soluzione personalizzata. Realizziamo progetti su misura 
                        per qualsiasi esigenza tecnologica.
                    </p>
                    <Link 
                        to="/login"
                        className="btn-primary"
                        style={{ 
                            padding: '1rem 2.5rem', 
                            width: 'auto', 
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        Richiedi Preventivo
                        <ArrowRight size={18} />
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
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    © 2025 Matty47ghigo Studios. Tutti i diritti riservati.
                </p>
            </footer>
        </div>
    );
};

export default Shop;
