import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Privacy = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', color: 'white' }}>
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
                        <Shield size={22} />
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase', color: 'white' }}>
                        matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
                    </div>
                </Link>
                
                <Link to="/" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', borderRadius: '50px' }}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                    Torna al Sito
                </Link>
            </nav>

            {/* Content */}
            <section style={{ paddingTop: '140px', paddingBottom: '4rem' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Politica sulla <span className="text-gradient">Privacy</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Ultimo aggiornamento: Febbraio 2025
                    </p>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        lineHeight: 1.8
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>1. Introduzione</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Matty47ghigo Studios ("noi", "nostro" o "l'Applicazione") si impegna a proteggere la privacy dei propri utenti. 
                            Questa Politica sulla Privacy spiega come raccogliamo, utilizziamo, divulghiamo e proteggiamo le informazioni 
                            quando utilizzi il nostro sito web e i nostri servizi.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. Informazioni Raccolte</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Raccogliamo le seguenti informazioni:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Informazioni di registrazione (nome, email, password)</li>
                            <li>Informazioni di profilo (foto, preferenze)</li>
                            <li>Dati di utilizzo del servizio</li>
                            <li>Informazioni di pagamento (trattate in modo sicuro tramite provider di pagamento terzi)</li>
                            <li>Log di accesso e interazioni con il servizio</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Utilizzo delle Informazioni</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Utilizziamo le informazioni raccolte per:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Fornire, mantenere e migliorare i nostri servizi</li>
                            <li>Elaborare transazioni e inviare informazioni relative</li>
                            <li>Inviare comunicazioni promozionali (con consenso)</li>
                            <li>Verificare l'identità degli utenti</li>
                            <li>Prevenire frodi e garantire la sicurezza</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Protezione dei Dati</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Implementiamo misure di sicurezza tecniche e organizzative appropriate per proteggere le 
                            informazioni personali contro accessi non autorizzati, alterazioni, divulgazioni o distruzioni.
                            Utilizziamo crittografia SSL/TLS per tutti i dati trasmessi e memorizziamo le password 
                            in forma crittografata utilizzando algoritmi sicuri.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Condivisione delle Informazioni</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Non vendiamo né affittiamo le informazioni personali degli utenti a terzi. Condividiamo 
                            le informazioni solo con:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Provider di servizi che ci assistono nell'erogazione dei servizi</li>
                            <li>Autorità giudiziarie quando richiesto dalla legge</li>
                            <li>In caso di fusione, acquisizione o vendita di assets</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>6. Cookies e Tecnologie Simili</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Utilizziamo cookies e tecnologie simili per migliorare l'esperienza utente, analizzare 
                            il traffico del sito e personalizzare i contenuti. Puoi controllare i cookies attraverso 
                            le impostazioni del tuo browser.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>7. I Tuoi Diritti</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Hai il diritto di:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Accedere alle tue informazioni personali</li>
                            <li>Richiedere la correzione di dati inesatti</li>
                            <li>Richiedere la cancellazione dei tuoi dati</li>
                            <li>Opporti al trattamento dei tuoi dati</li>
                            <li>Richiedere la portabilità dei dati</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>8. Conservazione dei Dati</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Conserviamo le informazioni personali per il tempo necessario a fornire i servizi richiesti 
                            e per scopi legittimi di business, salvo diversa richiesta dell'utente o obbligo legale.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>9. Contatti</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per domande su questa Politica sulla Privacy o per esercitare i tuoi diritti, contattaci a:
                            <br />
                            <strong>Email:</strong> business.matty47ghigo@gmail.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Privacy;
