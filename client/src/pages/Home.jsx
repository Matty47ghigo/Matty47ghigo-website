import React from 'react';
import { Briefcase, Code, Terminal, MessageSquare } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ height: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h1 className="title" style={{ fontSize: '4rem' }}>Matty47ghigo</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.8, marginBottom: '2rem' }}>Sviluppatore Web</p>
        <p style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          Realizzo siti e applicazioni web semplici da usare, affidabili e pensate per durare nel tempo.
        </p>
        <a href="#contact" className="btn">Contattami</a>
      </section>

      {/* Chi Sono */}
      <section className="section container" style={{ padding: '4rem 20px' }}>
        <h2 className="title">Chi sono</h2>
        <p>
          Sono <strong>Matty47ghigo</strong>. Il mio lavoro parte sempre da un’esigenza concreta: capire cosa serve davvero e costruire una soluzione chiara, senza complicazioni inutili.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Mi occupo sia della parte visiva sia di quella tecnica, seguendo il progetto dall’idea iniziale alla messa online. Lavoro con metodo, ascolto molto e propongo soluzioni comprensibili anche a chi non ha competenze tecniche.
        </p>
      </section>

      {/* Come Lavoro */}
      <section className="section container" style={{ padding: '4rem 20px', backgroundColor: 'var(--card-bg)', borderRadius: '10px' }}>
        <h2 className="title">Come lavoro</h2>
        <p>Ecco il punto. Prima di scrivere codice, ascolto.</p>
        <p style={{ marginTop: '1rem' }}>
          Analizzo l’obiettivo, il pubblico e il contesto. Poi progetto una struttura semplice, solida e facile da mantenere. Durante lo sviluppo mantengo una comunicazione chiara, aggiorno sui progressi e spiego le scelte in modo diretto. Consegno solo quando tutto funziona come deve.
        </p>
        <p style={{ marginTop: '1rem', fontStyle: 'italic', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>
          Preferisco pochi passaggi fatti bene, piuttosto che soluzioni complesse che creano problemi dopo.
        </p>
      </section>

      {/* Cosa posso fare */}
      <section className="section container" style={{ padding: '4rem 20px' }}>
        <h2 className="title">Cosa posso fare per te</h2>
        <div className="grid">
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal color="var(--primary-color)" /> Siti web chiari, veloci e responsive
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code color="var(--primary-color)" /> Applicazioni web su misura
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase color="var(--primary-color)" /> Sistemazione e miglioramento di siti esistenti
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code color="var(--primary-color)" /> Integrazione di funzionalità e servizi esterni
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare color="var(--primary-color)" /> Supporto tecnico e manutenzione
            </li>
          </ul>
        </div>
      </section>

      {/* Footer / Login Link */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #333', marginTop: '4rem' }}>
        <p>Se hai un’idea o un problema da risolvere, possiamo partire da lì e costruire qualcosa che funzioni davvero.</p>
        <div style={{ marginTop: '2rem', opacity: 0.5 }}>
          <a href="/login" style={{ fontSize: '0.8rem' }}>Admin Login</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
