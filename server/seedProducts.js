// Script per il seeding dei prodotti nello shop
// Eseguire con: node seedProducts.js

require('dotenv').config();
const mongoose = require('mongoose');

// Stringa di connessione MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://matty47ghigo:Matty47ghigo231747@studios.ionqjua.mongodb.net/';

// Schema Product inline per evitare problemi di import
const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    priceValue: { type: Number, required: true },
    features: [String],
    plans: [{
        name: String,
        slots: Number,
        price: String
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

const defaultProducts = [
    // Web Editing
    {
        id: 'creazione-sito-web',
        category: 'web-editing',
        title: 'Creazione Sito Web',
        description: 'Sito web moderno e responsivo creato da zero secondo le tue esigenze. Include design personalizzato, ottimizzazione SEO e hosting iniziale.',
        price: 'Da €299',
        priceValue: 299,
        features: ['Design personalizzato', 'Responsivo (mobile-friendly)', 'Ottimizzazione SEO base', 'Contatti email inclusi', '1 mese di supporto']
    },
    {
        id: 'modernizzazione-sito',
        category: 'web-editing',
        title: 'Modernizzazione Sito Web',
        description: 'Rinnovo completo del tuo sito esistente con design moderno, miglioramento delle performance e aggiornamento tecnologico.',
        price: 'Da €149',
        priceValue: 149,
        features: ['Restyling grafico', 'Miglioramento performance', 'Ottimizzazione mobile', 'Aggiornamento contenuti', '6 mesi di manutenzione']
    },
    {
        id: 'sitoweb-minecraft-rp',
        category: 'web-editing',
        title: 'Sito Web per Minecraft/Roleplay',
        description: 'Sito web dedicato a server Minecraft o community roleplay con sistema autenticazione, store, forum e status del server.',
        price: 'Da €199',
        priceValue: 199,
        features: ['Sistema autenticazione', 'Store integrato', 'Status server live', 'Forum community', 'Patchnotes automatiche']
    },
    // Bot
    {
        id: 'bot-discord',
        category: 'bot',
        title: 'Bot Discord Personalizzato',
        description: 'Bot Discord su misura per le tue esigenze con comandi personalizzati, automazioni, moderazione e integrazioni.',
        price: 'Da €49',
        priceValue: 49,
        features: ['Comandi personalizzati', 'Sistema moderazione', 'Logging avanzato', 'Integrazione API', 'Hosting incluso 1 mese']
    },
    {
        id: 'bot-telegram',
        category: 'bot',
        title: 'Bot Telegram',
        description: 'Bot Telegram per automazione, gestione community, notifiche e molto altro.',
        price: 'Da €39',
        priceValue: 39,
        features: ['Comandi personalizzati', 'Notifiche automatiche', 'Gestione gruppi', 'Webhook integrations', 'Hosting incluso 1 mese']
    },
    {
        id: 'bot-minecraft',
        category: 'bot',
        title: 'Plugin/Mod Discord-MC',
        description: 'Bridge e plugin per collegare il tuo server Minecraft con Discord per chat cross-platform.',
        price: 'Da €29',
        priceValue: 29,
        features: ['Chat sincronizzata', 'Rich presence', 'Notifiche eventi', 'Kill/death tracker', 'Compattibile with Spigot/Paper']
    },
    // Settaggi
    {
        id: 'setup-database',
        category: 'settaggi',
        title: 'Configurazione Database',
        description: 'Setup completo di database MySQL, PostgreSQL o MongoDB ottimizzato per le tue applicazioni.',
        price: 'Da €29',
        priceValue: 29,
        features: ['Installazione e configurazione', 'Ottimizzazione query', 'Backup automatizzati', 'Sicurezza avanzata', 'Documentazione']
    },
    {
        id: 'setup-discord-server',
        category: 'settaggi',
        title: 'Setup Discord Server',
        description: 'Configurazione completa del tuo server Discord con canali, ruoli, bot e automazioni.',
        price: 'Da €49',
        priceValue: 49,
        features: ['Struttura canali personalizzata', 'Sistema ruoli', 'Widget server', 'Vanity URL', 'Server banner professionale']
    },
    {
        id: 'setup-vps',
        category: 'settaggi',
        title: 'Configurazione VPS',
        description: 'Setup e ottimizzazione VPS per hosting di applicazioni web, bot, game server e molto altro.',
        price: 'Da €59',
        priceValue: 59,
        features: ['Installazione SO', 'Configurazione firewall', 'SSL/HTTPS', 'Reverse proxy (Nginx)', 'Performance tuning']
    },
    {
        id: 'setup-web-server',
        category: 'settaggi',
        title: 'Setup Web Server',
        description: 'Configurazione web server Nginx o Apache con ottimizzazioni per alte performance e sicurezza.',
        price: 'Da €49',
        priceValue: 49,
        features: ['Server web ottimizzato', 'Configurazione SSL', 'Cache avanzata', 'Protezione DDoS base', 'Monitoraggio']
    },
    {
        id: 'setup-minecraft-server',
        category: 'settaggi',
        title: 'Setup Minecraft Server',
        description: 'Configurazione e ottimizzazione server Minecraft per performance ottimali e migliore esperienza di gioco.',
        price: 'Da €39',
        priceValue: 39,
        features: ['Paper/Spigot setup', 'Ottimizzazione performance', 'Plugins essenziali', 'Backup automatici', 'Anti-lag tuning']
    },
    // Server
    {
        id: 'server-minecraft',
        category: 'server',
        title: 'Minecraft Server Hosting',
        description: 'Hosting server Minecraft con hardware dedicato, uptime garantito e supporto tecnico specializzato.',
        price: '€5-25/mes',
        priceValue: 5,
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
        category: 'server',
        title: 'Discord Server Setup Pro',
        description: 'Servizio completo di setup e gestione server Discord professionale per community grandi.',
        price: 'Da €79',
        priceValue: 79,
        features: ['Design premium server', 'Bot personalizzati', 'Widget avanzati', 'Analytics community', '1 mese gestione inclusa']
    },
    // Consulenze
    {
        id: 'consulenza-sviluppo',
        category: 'consulenze',
        title: 'Consulenza Sviluppo Software',
        description: 'Sessione di consulenza per progettazione software, architettura applicativa e best practices di sviluppo.',
        price: '€30/ora',
        priceValue: 30,
        features: ['Analisi requisiti', 'Progettazione architettura', 'Code review', 'Consigli ottimizzazione', 'Documentazione tecnica']
    },
    {
        id: 'consulenza-infra',
        category: 'consulenze',
        title: 'Consulenza Infrastruttura IT',
        description: 'Consulenza su infrastrutture IT, server, cloud e sicurezza informatica per aziende e privati.',
        price: '€40/ora',
        priceValue: 40,
        features: ['Analisi infrastruttura', 'Piano migrazione cloud', 'Sicurezza informatica', 'Cost optimization', 'Report dettagliato']
    },
    {
        id: 'consulenza-gaming',
        category: 'consulenze',
        title: 'Consulenza Gaming Community',
        description: 'Consulenza per community gaming su setup server, moderazione, engagement e monetizzazione.',
        price: '€25/ora',
        priceValue: 25,
        features: ['Strategia community', 'Setup tecnico', 'Monetizzazione', 'Event planning', 'Growth strategy']
    }
];

async function seed() {
    try {
        console.log('Connessione a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Connesso a MongoDB Atlas!');

        console.log('Eliminazione prodotti esistenti...');
        await Product.deleteMany({});

        console.log('Inserimento nuovi prodotti...');
        await Product.insertMany(defaultProducts);

        console.log(`\n✅ Seed completato! ${defaultProducts.length} prodotti inseriti.`);
        
        await mongoose.connection.close();
        console.log('Connessione chiusa.');
        process.exit(0);
    } catch (error) {
        console.error('Errore durante il seed:', error.message);
        process.exit(1);
    }
}

seed();
