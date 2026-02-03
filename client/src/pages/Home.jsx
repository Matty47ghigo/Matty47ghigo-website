import React from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { Briefcase, Code, Terminal, MessageSquare, ArrowRight, Zap, Layout, Settings, Github } from 'lucide-react';
import axios from 'axios';
import logo from '../assets/logo.png';

const Home = () => {
  const [showAccessMenu, setShowAccessMenu] = React.useState(false);

  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + '/login';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // useGoogleLogin returns an access token by default with 'implicit' flow.
        // However, the backend verifyIdToken expects an ID Token.
        // For @react-oauth/google, we can use the 'googleLogin' component for ID tokens,
        // or configure 'useGoogleLogin' to use 'auth-code' flow (requires backend swap).
        // Let's stick to the simplest: Use the 'GoogleLogin' component for ID tokens as it's more standard for server-side verification.
        console.log("Token Response:", tokenResponse);
      } catch (err) {
        console.error("Login failed", err);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post('http://localhost:3001/api/auth/google', { 
        token: response.credential 
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Server verify failed", err);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggeredChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="home-page">
      
      {/* Navbar Overlay */}
      <nav 
        className="liquid-glass"
        style={{ 
          position: 'fixed', 
          top: '1rem', 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%', 
          maxWidth: '1200px',
          padding: '0.8rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 100,
          borderRadius: '100px',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)'
            }} 
          />
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1.5px' }}>
            Matty<span style={{color: 'var(--primary)'}}>47ghigo</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#about" className="nav-link">Chi Sono</a>
          <a href="#services" className="nav-link">Servizi</a>
          <a href="#contact" className="nav-link">Contatti</a>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              style={{ 
                fontSize: '0.8rem', 
                background: 'var(--primary)', 
                color: '#000', 
                padding: '10px 24px', 
                borderRadius: '50px', 
                border: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)'
              }}
            >
              Accesso
            </button>

            {showAccessMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{ 
                  position: 'absolute', 
                  top: '60px', 
                  right: 0, 
                  width: '280px', 
                  background: 'rgba(5, 5, 5, 0.95)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 1000
                }}
              >
                <div style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600, color: '#fff' }}>Accedi con:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Login Failed')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                      />
                   </div>
                   
                   <button 
                      onClick={handleGitHubLogin}
                      style={{ 
                        width: '100%',
                        padding: '12px', 
                        borderRadius: '50px', 
                        background: '#24292e', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#2f363d'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#24292e'}
                    >
                      <Github size={20} /> Accedi con GitHub
                    </button>

                   <button 
                      onClick={() => window.location.href = 'https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify+email'}
                      style={{ 
                        width: '100%',
                        padding: '12px', 
                        borderRadius: '50px', 
                        background: '#5865F2', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#4752C4'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#5865F2'}
                    >
                      <MessageSquare size={20} /> Accedi con Discord
                    </button>
                </div>
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                   <a href="/login" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Oppure vai alla Dashboard →</a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        padding: '0 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%' }} 
        />
        <motion.div 
           animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0] }}
           transition={{ duration: 25, repeat: Infinity }}
           style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%' }} 
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ zIndex: 1, maxWidth: '800px' }}
        >
          <motion.div variants={itemVariants}>
             <span style={{ 
               display: 'inline-block', 
               padding: '5px 15px', 
               borderRadius: '20px', 
               background: 'rgba(255,255,255,0.1)', 
               fontSize: '0.9rem', 
               marginBottom: '1rem',
               border: '1px solid rgba(255,255,255,0.2)'
             }}>
               👋 Ciao, sono Mattia
             </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 1.1 }}>
            Sviluppo Esperienze Web <span style={{ color: 'transparent', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Indimenticabili</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Trasformo le tue idee in realtà digitale. Siti veloci, design curati e nessun codice inutile.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contact" className="btn">Iniziamo un Progetto <ArrowRight size={18} style={{marginLeft: '5px', verticalAlign: 'middle'}}/></a>
            <a href="#about" style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', fontWeight: 'bold' }}>Scopri di più</a>
          </motion.div>
        </motion.div>
      </section>

      {/* Chi Sono */}
      <section id="about" className="section container" style={{ padding: '6rem 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="title" style={{ fontSize: '2.5rem' }}>Chi sono</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#ccc' }}>
              Sono <strong>Matty47ghigo</strong>. Non sono il classico sviluppatore che parla solo in binario. Il mio approccio è umano: capisco il problema, poi scrivo il codice.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#ccc' }}>
               Mi occupo di tutto il ciclo di vita del software. Dall'idea scarabocchiata su un tovagliolo fino al deploy in produzione. La mia filosofia? <strong>Semplicità e Robustezza.</strong>
            </p>
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }} 
             whileInView={{ opacity: 1, scale: 1 }} 
             viewport={{ once: true }}
             style={{ position: 'relative' }}
          >
             <div style={{ 
               width: '100%', 
               height: '400px', 
               background: 'linear-gradient(45deg, var(--secondary), var(--primary))', 
               borderRadius: '20px', 
               opacity: 0.8,
               transform: 'rotate(-3deg)'
             }}></div>
             <div style={{ 
               position: 'absolute', 
               top: 0, 
               left: 0, 
               width: '100%', 
               height: '400px', 
               background: '#1a1a1a', 
               borderRadius: '20px', 
               border: '1px solid rgba(255,255,255,0.1)',
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               transform: 'rotate(3deg) translate(10px, -10px)',
               boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
             }}>
                <Code size={100} color="var(--primary)" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Come Lavoro (Cards) */}
      <section className="section container" style={{ padding: '6rem 20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 className="title" style={{ fontSize: '2.5rem' }}>Come lavoro</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>Un processo chiaro e cristallino. Niente sorprese, solo risultati.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { icon: <MessageSquare size={40} />, title: "1. Ascolto", desc: "Prima di tutto, capisco chi sei e cosa ti serve davvero." },
            { icon: <Layout size={40} />, title: "2. Progetto", desc: "Disegno la struttura ideale, semplice e scalabile." },
            { icon: <Code size={40} />, title: "3. Sviluppo", desc: "Scrivo codice pulito, moderno e performante." },
            { icon: <Zap size={40} />, title: "4. Consegno", desc: "Testo tutto e ti consegno un prodotto pronto all'uso." }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, borderColor: 'var(--primary)' }}
              style={{ 
                padding: '2rem', 
                background: 'var(--card-bg)', 
                borderRadius: '15px', 
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.title}</h3>
              <p style={{ color: '#aaa' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cosa posso fare */}
      <section id="services" className="section container" style={{ padding: '6rem 20px' }}>
        <h2 className="title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>I Miei Servizi</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
           {[
             { name: "Siti Web Custom", desc: "Non uso template pronti. Costruisco il tuo sito da zero su misura." },
             { name: "Web App", desc: "Applicazioni complesse (React, Node) che funzionano come software desktop." },
             { name: "Restyling", desc: "Il tuo sito è vecchio? Gli do una nuova vita, moderna e veloce." },
             { name: "Manutenzione", desc: "Non ti abbandono dopo il lancio. Tengo tutto aggiornato e sicuro." }
           ].map((service, idx) => (
             <motion.div
               key={idx}
               whileHover={{ scale: 1.02 }}
               style={{ 
                 display: 'flex', 
                 alignItems: 'flex-start', 
                 gap: '15px', 
                 padding: '1.5rem',
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                 borderRadius: '10px'
               }}
             >
               <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '50%', color: '#fff' }}>
                 <Settings size={20} />
               </div>
               <div>
                 <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{service.name}</h4>
                 <p style={{ fontSize: '0.9rem', color: '#999' }}>{service.desc}</p>
               </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#050505', borderTop: '1px solid #222' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Hai un progetto in mente?</h2>
          <p style={{ marginBottom: '2rem', color: '#888' }}>Parliamone. Niente impegno, solo idee chiare.</p>
          <a href="mailto:mattiaghigo60@gmail.com" className="btn">Scrivimi una Mail</a>
          
          <div style={{ marginTop: '4rem', opacity: 0.4, fontSize: '0.8rem' }}>
            &copy; 2025 Matty47ghigo Studios. Made with ❤️ and React.
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Home;
