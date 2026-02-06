import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { Briefcase, Code, Terminal, MessageSquare, ArrowRight, Zap, Layout, Settings, Github, Cpu, Globe, Database, ShieldCheck, Menu, X } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import profileAbout from '../assets/profile-about.jpg';

const Home = () => {
  const [showAccessMenu, setShowAccessMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleGitHubLogin = () => {
    localStorage.setItem('auth_provider', 'github');
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + '/callback';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const handleDiscordLogin = () => {
    localStorage.setItem('auth_provider', 'discord');
    window.location.href = 'https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify+email';
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post('/api/auth/google', { 
        token: response.credential 
      });
      
      // Check if 2FA is required
      if (res.data.message === '2FA_REQUIRED') {
        localStorage.setItem('tempUserId', res.data.userId);
        localStorage.setItem('tempId', res.data.tempId);
        window.location.href = '/login';
        return;
      }

      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.isAdmin ? '/dashboard' : '/user-dashboard';
    } catch (err) {
      console.error("Server verify failed", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const experience = [
    {
      company: "Antico Borgo",
      role: "Stagista Bar",
      period: "11/2025 - Attuale",
      icon: <Globe size={20} />,
      desc: "Gestione del servizio al banco e supporto alla clientela in ambiente dinamico."
    },
    {
      company: "Salesiani Don Bosco",
      role: "Animatore Volontario",
      period: "10/2025 - Attuale",
      icon: <MessageSquare size={20} />,
      desc: "Coordinamento di attività educative e ricreative per ragazzi."
    },
    {
      company: "Isforcoop",
      role: "Barista (Laboratorio)",
      period: "02/2025 - Attuale",
      icon: <Briefcase size={20} />,
      desc: "Formazione pratica avanzata in tecniche di caffetteria e servizio."
    },
    {
      company: "Letimbro Computers",
      role: "Tecnico Informatico (Stage)",
      period: "03/2025 - 05/2025",
      icon: <Cpu size={20} />,
      desc: "Riparazione hardware, configurazione software e assistenza tecnica diretta agli utenti."
    }
  ];

  const education = [
    {
        title: "Biennio ITIS - Informatica",
        institution: "ITIS Mario Del Pozzo Cuneo",
        period: "09/2022 - 06/2024"
    },
    {
        title: "Corsi Professionali Isforcoop",
        institution: "Savona",
        period: "2025 - Attuale",
        details: ["Cocktail", "Sartoria", "Sicurezza sul lavoro"]
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', color: 'white', position: 'relative' }}>
      
      {/* High-Tech Background Elements */}
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
          maxWidth: '1200px',
          padding: '1rem 2.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 100,
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <Terminal size={22} />
          </div>
          <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase' }}>
            matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
          </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex" style={{ gap: '2.5rem', alignItems: 'center', display: 'none' }}>
            {/* Added display flex via css class media query simulation manually later, but for now hardcode logic in jsx */}
            <style>{`@media (min-width: 768px) { .hidden.md\\:flex { display: flex !important; } }`}</style>
          
          <a href="#about" className="nav-link" style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Chi Sono</a>
          <a href="#experience" className="nav-link" style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Esperienza</a>
          <a href="#services" className="nav-link" style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Servizi</a>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              className="btn-primary"
              style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', width: 'auto', fontSize: '0.8rem' }}
            >
              Accesso Platform
            </button>

            {showAccessMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{ 
                  position: 'absolute', 
                  top: '55px', 
                  right: 0, 
                  width: '280px', 
                  background: '#0d0e1b', 
                  backdropFilter: 'blur(30px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                  zIndex: 1000
                }}
              >
                <div style={{ fontSize: '0.65rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Security Gate</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess}
                      theme="filled_black"
                      shape="pill"
                    />
                    
                    <button onClick={handleGitHubLogin} className="btn-social">
                       <Github size={16} /> Authenticate with GitHub
                    </button>

                    <button className="btn-social" onClick={handleDiscordLogin}>
                       <MessageSquare size={16} /> Access with Discord
                    </button>
                </div>
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'center' }}>
                   <Link to="/login" style={{ fontSize: '0.75rem', color: 'white', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      Dashboard Amministratore <ArrowRight size={14} />
                   </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden" style={{ display: 'flex' }}>
            <style>{`@media (min-width: 768px) { .md\\:hidden { display: none !important; } }`}</style>
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
                <Menu size={28} />
            </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100vh',
                    background: '#0d0e1b',
                    zIndex: 200,
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <X size={32} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
                    <a href="#about" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Chi Sono</a>
                    <a href="#experience" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Esperienza</a>
                    <a href="#services" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Servizi</a>
                    
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }} />
                    
                    <button 
                        onClick={() => {
                            setShowAccessMenu(!showAccessMenu); 
                            // If we toggle access menu here, it might be better to just show the login buttons directly on mobile
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', textAlign: 'left', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                        Accesso Platform
                    </button>

                    <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" />
                    
                    <button onClick={handleGitHubLogin} className="btn-social" style={{ padding: '1rem' }}>
                        <Github size={20} /> Authenticate with GitHub
                    </button>
                    
                    <button className="btn-social" onClick={handleDiscordLogin} style={{ padding: '1rem' }}>
                        <MessageSquare size={20} /> Access with Discord
                    </button>
                    
                    <Link to="/login" className="btn-secondary" style={{ marginTop: '1rem', textAlign: 'center' }}>
                         Area Amministratore
                    </Link>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ zIndex: 1, textAlign: 'center', maxWidth: '1000px', padding: '0 1.5rem' }}
        >
          <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
              <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.5rem 1rem', 
                  borderRadius: '100px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  letterSpacing: '0.05em'
              }}>
                <div style={{ width: '8px', height: '8px', background: '#00e5ff', borderRadius: '50%', boxShadow: '0 0 10px #00e5ff' }} />
                STATUS: DISPONIBILE PER NUOVI PROGETTI
              </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="title" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.9, marginBottom: '2rem' }}>
            Crafting the <br/><span className="text-gradient">Next Century</span> of Web
          </motion.h1>
          
          <motion.p variants={itemVariants} style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.7 }}>
            Matty47ghigo Studios progetta e sviluppa infrastrutture digitali ad alte prestazioni con un focus ossessivo su design e scalabilità.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#services" className="btn-primary" style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1rem' }}>
              Inizia Ora <ArrowRight size={18} style={{marginLeft: '0.75rem'}}/>
            </a>
            <a href="#experience" className="btn-secondary" style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1rem' }}>
              Visualizza Expertise
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="section container" style={{ padding: '10rem 1.5rem', position: 'relative' }}>
        {/* Changed grid-cols-2 to grid-cols-1 md:grid-cols-2 */}
        <div className="grid grid-cols-1 md-grid-cols-2 gap-20" style={{ alignItems: 'center' }}>
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               style={{ position: 'relative', maxWidth: '450px', margin: '0 auto', order: 0 }} 
            >
                {/* On mobile (grid-cols-1), DOM order is naturally preserved (image first). This is what we want. */}
                <div style={{ position: 'absolute', inset: -20, background: 'linear-gradient(135deg, #00e5ff 0%, #0099cc 100%)', borderRadius: '30px', opacity: 0.1, zIndex: 0, filter: 'blur(20px)' }} />
                <div style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <img src={profileAbout} alt="Mattia Ghigo" style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }} />
                </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
                <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Chi <span className="text-gradient">Sono</span></h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
                    <p>
                        Sono <strong>Mattia Ghigo</strong>, sviluppatore e studente con una forte passione per l’informatica e la tecnologia. Mi occupo principalmente di sviluppo software, bot e plugin personalizzati, con diversi anni di esperienza pratica in <strong>JavaScript</strong>, <strong>Node.js</strong> e <strong>Discord.js</strong>. Nel tempo ho lavorato anche con C, Java e tecnologie web come HTML e CSS, sviluppando progetti reali e funzionali orientati alla soluzione di problemi concreti.
                    </p>
                    <p>
                        Il mio percorso nasce dalla curiosità: ho iniziato sperimentando in autonomia, poi ho rafforzato le competenze con studi tecnici in ambito informatico e con un’esperienza diretta come tecnico IT, dove ho imparato a ragionare in modo pratico, strutturato e orientato ai risultati. Mi piace progettare sistemi chiari, efficienti e curati nei dettagli, che non siano solo codice ma strumenti utili.
                    </p>
                    <p>
                         Sono una persona pragmatica, costante e orientata alla crescita continua. Studio, provo, sbaglio, miglioro. Ogni progetto per me è un passo avanti, sia a livello tecnico sia mentale. 🚀
                    </p>
                </div>
                
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['JavaScript', 'Node.js', 'React', 'Discord.js', 'MongoDB', 'C/C++'].map((tech, i) => (
                        <span key={i} style={{ 
                            padding: '0.5rem 1rem', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--border-subtle)', 
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-dim)'
                        }}>
                            {tech}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section container" style={{ padding: '10rem 1.5rem' }}>
        <div style={{ marginBottom: '5rem' }}>
             <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Traiettoria Professionale</h2>
             <p className="text-muted">Il mio percorso nel mondo del tech e oltre.</p>
        </div>

        {/* Changed grid-cols-2 to grid-cols-1 md:grid-cols-2 */}
        <div className="grid grid-cols-1 md-grid-cols-2 gap-10">
            <div className="flex-col gap-6">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '1rem' }}>Esperienza Lavorativa</h3>
                {experience.map((exp, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                        style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                    >
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                            {exp.icon}
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{exp.company}</h4>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{exp.period}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{exp.role}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{exp.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex-col gap-6">
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '1rem' }}>Formazione Scolastica</h3>
                 {education.map((edu, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                        style={{ padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{edu.title}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800 }}>{edu.period}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{edu.institution}</p>
                        {edu.details && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {edu.details.map((d, k) => (
                                    <span key={k} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.75rem', borderRadius: '50px', border: '1px solid var(--border-subtle)' }}>{d}</span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                 ))}
                 
                 <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)', borderStyle: 'dashed' }}>
                    <div className="flex-center" style={{ padding: '2rem', textAlign: 'center', gap: '1rem' }}>
                        <ShieldCheck size={32} style={{ opacity: 0.3 }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sempre in aggiornamento con le ultime tecnologie industrial-grade.</p>
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* Services Boosted */}
      <section id="services" className="section container" style={{ padding: '10rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 className="title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Service Infrastructure</h2>
            <p className="text-muted">Soluzioni tecniche per esigenze moderne.</p>
        </div>
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-2 gap-6">
           {/* Forced grid-cols-1 on phone, map handled naturally */}
           {[
             { name: "Full-Stack Dev", icon: <Layout />, desc: "Architetture scalabili con React, Next.js e Node.js." },
             { name: "UI/UX Design", icon: <Settings />, desc: "Interfacce minimalist e premium con focus sul core-business." },
             { name: "Database Design", icon: <Database />, desc: "Ottimizzazione e gestione dati con MongoDB e PostgreSQL." },
             { name: "Security Audit", icon: <ShieldCheck />, desc: "Verifica e messa in sicurezza della tua infrastruttura digitale." }
           ].map((s, idx) => (
             <motion.div
               key={idx}
               whileHover={{ y: -10 }}
               style={{ 
                 padding: '2.5rem',
                 background: 'rgba(255,255,255,0.01)',
                 borderRadius: '1.5rem',
                 border: '1px solid var(--border-subtle)',
                 textAlign: 'center'
               }}
             >
               <div style={{ width: '50px', height: '50px', margin: '0 auto 1.5rem', background: 'white', color: 'black', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {s.icon}
               </div>
               <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>{s.name}</h4>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ textAlign: 'center', padding: '10rem 1.5rem', background: '#020202', borderTop: '1px solid var(--border-subtle)' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Let's build the <span className="text-gradient">Future</span>.</h2>
          <p style={{ marginBottom: '3.5rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Disponibile per consulenze e collaborazioni strategiche.</p>
          <Link to="/dashboard/support" className="btn-primary" style={{ width: 'auto', padding: '1.25rem 3.5rem', display: 'inline-flex', fontSize: '1.1rem' }}>Contattami</Link>
          
          <div style={{ marginTop: '8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>matty47ghigo.studios</div>
            <div style={{ opacity: 0.3, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
              &copy; 2026 Matty47ghigo Studios. Crafted with Precision.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Github size={18} style={{ opacity: 0.5 }} />
                <Globe size={18} style={{ opacity: 0.5 }} />
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Home;
