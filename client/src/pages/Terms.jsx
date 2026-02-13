import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const Terms = () => {
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
                        <FileText size={22} />
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
                        Termini di <span className="text-gradient">Servizio</span>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>1. Accettazione dei Termini</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Accedendo e utilizzando i servizi di Matty47ghigo Studios, accetti di essere vincolato 
                            da questi Termini di Servizio. Se non accetti questi termini, non puoi utilizzare i nostri servizi.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. Descrizione dei Servizi</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Matty47ghigo Studios offre i seguenti servizi:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Sviluppo e design siti web</li>
                            <li>Creazione e configurazione bot Discord e Telegram</li>
                            <li>Configurazione server (VPS, Minecraft, Web)</li>
                            <li>Consulenze tecniche</li>
                            <li>Servizi di hosting</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Account Utente</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per utilizzare alcuni servizi, devi creare un account. Sei responsabile di:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Mantenere la riservatezza delle tue credenziali</li>
                            <li>Tutte le attività che avvengono sotto il tuo account</li>
                            <li>Notificarci immediatamente qualsiasi uso non autorizzato</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Proprietà Intellettuale</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Tutti i contenuti, design, codice e materiali presenti sul nostro sito e nei nostri servizi 
                            sono di nostra proprietà o concessi in licenza. Non puoi copiare, modificare, distribuire 
                            o utilizzare i nostri materiali senza il nostro consenso scritto.
                        </p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per servizi di sviluppo personalizzato, la proprietà del codice consegnato 
                            viene trasferita al cliente dopo il pagamento completo.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Obblighi dell'Utente</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Utilizzando i nostri servizi, accetti di NON:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Utilizzare i servizi per attività illegali</li>
                            <li>Interferire con il funzionamento dei nostri server</li>
                            <li>Tentare di accedere a sistemi non autorizzati</li>
                            <li>Utilizzare i nostri servizi per distribuire malware</li>
                            <li>Violare i diritti di proprietà intellettuale di terzi</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>6. Pagamenti e Fatturazione</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            I pagamenti sono elaborati tramite Stripe e PayPal. Accetti che:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>I prezzi sono espressi in EUR salvo diversamente indicato</li>
                            <li>I servizi sono fatturati secondo le tariffe vigenti al momento dell'ordine</li>
                            <li>Per servizi ricorrenti, autorizzi l'addebito periodico</li>
                            <li>I rimborsi sono soggetti alla nostra politica di recesso</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>7. Limitazione di Responsabilità</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Nella massima misura consentita dalla legge applicabile:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Non siamo responsabili per danni indiretti, consequenziali o punitivi</li>
                            <li>La nostra responsabilità totale è limitata all'importo pagato da te nei 12 mesi precedenti</li>
                            <li>Non garantiamo che i servizi saranno ininterrotti o privi di errori</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>8. Garanzie</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            I servizi sono forniti "COME SONO" e "COME DISPONIBILI". Non offriamo garanzie 
                            esplicite o implicite oltre a quelle espressamente indicate nella nostra politica di recesso.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>9. Sospensione e Risoluzione</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Possiamo sospendere o terminare il tuo accesso ai servizi se:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Violi questi Termini di Servizio</li>
                            <li>Utilizzi i servizi per attività illegali</li>
                            <li>Il tuo account rimane inattivo per più di 24 mesi</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>10. Modifiche ai Termini</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Ci riserviamo il diritto di modificare questi termini. Le modifiche saranno effettive 
                            15 giorni dopo la pubblicazione. L'utilizzo continuato dei servizi dopo le modifiche 
                            costituisce accettazione dei nuovi termini.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>11. Legge Applicabile</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Questi Termini sono regolati dalla legge italiana. Per qualsiasi controversia 
                            sarà competente il Foro di Cuneo.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>12. Contatti</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per domande su questi Termini di Servizio:
                            <br />
                            <strong>Email:</strong> business.matty47ghigo@gmail.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Terms;
