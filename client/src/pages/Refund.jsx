import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, CreditCard } from 'lucide-react';

const Refund = () => {
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
                        <RefreshCw size={22} />
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
                        Politica di <span className="text-gradient">Recesso</span>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>1. Diritto di Recesso</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), hai il diritto di recedere dal contratto di 
                            acquisto dei servizi digitali senza dover fornire alcuna motivazione, entro <strong>14 giorni</strong> 
                            dalla data di conclusione del contratto.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. Esclusioni dal Diritto di Recesso</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Il diritto di recesso NON si applica a:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Servizi digitali di cui hai già iniziato a beneficiare prima della scadenza del termine di recesso</li>
                            <li>Servizi personalizzati o realizzati su misura per il cliente</li>
                            <li>Plugin, bot o software personalizzato già consegnato</li>
                            <li>Servizi di hosting già attivati e utilizzati</li>
                            <li>Consulenze tecniche già erogate</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Modalità di Esercizio del Recesso</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per esercitare il diritto di recesso, devi inviarci una comunicazione scritta entro 14 giorni 
                            dalla conclusione del contratto tramite:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Email: <strong>business.matty47ghigo@gmail.com</strong></li>
                            <li>Ticket di supporto dalla dashboard utente</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Rimborso</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            In caso di recesso esercitato validamente e applicabile:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Il rimborso sarà effettuato entro <strong>14 giorni</strong> dalla data di ricezione della comunicazione</li>
                            <li>Utilizzeremo lo stesso mezzo di pagamento da te utilizzato per la transazione</li>
                            <li>Non ti saranno addebitate spese supplementari per il rimborso</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Servizi di Abbonamento</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per servizi di abbonamento (es. hosting mensile/annuale):
                        </p>
                        <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Il recesso è valido solo per il periodo non ancora iniziato</li>
                            <li>Il rimborso sarà calcolato proporzionalmente ai mesi non goduti</li>
                            <li>Eventuali sconti applicati saranno detratti dal rimborso</li>
                        </ul>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>6. Garanzia di Soddisfazione</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per servizi di sviluppo web e consulenza, offriamo una garanzia di soddisfazione. Se il lavoro 
                            consegnato non rispetta le specifiche concordate, contattaci entro 7 giorni dalla consegna 
                            per una revisione gratuita.
                        </p>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>7. Contatti</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Per domande sulla politica di recesso:
                            <br />
                            <strong>Email:</strong> business.matty47ghigo@gmail.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Refund;
