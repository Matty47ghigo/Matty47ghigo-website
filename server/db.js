const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/m47g_studios';

// --- Schemas ---

const UserSchema = new mongoose.Schema({
    name: String,
    surname: String,
    email: { type: String, unique: true },
    passwordHash: String,
    picture: String,
    address: String,
    cap: String,
    provider: { type: String, default: 'standard' },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    isBanned: { type: Boolean, default: false },
    linkedAccounts: {
        google: { type: String, default: null },
        github: { type: String, default: null },
        discord: { type: String, default: null }
    },
    paymentMethods: [{
        type: { type: String },
        last4: String,
        brand: String
    }],
    twoFactorSecret: String,
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorBackupCodes: [String],
    twoFactorType: { type: String, enum: ['totp', 'email', 'sms'], default: 'totp' },
    tempAuthCode: String,
    tempAuthCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: String,
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    messages: [{
        senderId: mongoose.Schema.Types.ObjectId,
        role: { type: String, enum: ['user', 'admin'] },
        content: String,
        date: { type: Date, default: Date.now }
    }],
    rating: { type: Number, default: null },
    feedbackComment: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        name: String,
        price: Number,
        image: String
    }],
    total: Number,
    status: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'pending' },
    date: { type: Date, default: Date.now }
});

const StatsSchema = new mongoose.Schema({
    visitors: { type: Number, default: 0 },
    guestVisitors: { type: Number, default: 0 },
    loggedVisitors: { type: Number, default: 0 },
    registeredUsers: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const AdminConfigSchema = new mongoose.Schema({
    isSetup: { type: Boolean, default: false },
    passwordHash: String,
    email: { type: String, default: "mattiaghigo60@gmail.com" }
});

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

// --- Models ---

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Order = mongoose.model('Order', OrderSchema);
const Stats = mongoose.model('Stats', StatsSchema);
const AdminConfig = mongoose.model('AdminConfig', AdminConfigSchema);
const Product = mongoose.model('Product', ProductSchema);

// --- Helpers ---

const getAdminStatus = async () => {
    let config = await AdminConfig.findOne();
    if (!config) {
        config = await AdminConfig.create({});
    }
    return config;
};

const incrementVisitors = async (isLogged = false) => {
    const update = { $inc: { visitors: 1 } };
    if (isLogged) {
        update.$inc.loggedVisitors = 1;
    } else {
        update.$inc.guestVisitors = 1;
    }
    await Stats.findOneAndUpdate({}, update, { upsert: true, new: true });
};

// --- Seed Products Function ---

async function seedProducts() {
    try {
        const defaultProducts = [
            { id: 'creazione-sito-web', category: 'web-editing', title: 'Creazione Sito Web', description: 'Sito web moderno e responsivo.', price: 'Da €299', priceValue: 299, features: ['Design personalizzato', 'Responsivo', 'SEO base'] },
            { id: 'modernizzazione-sito', category: 'web-editing', title: 'Modernizzazione Sito Web', description: 'Rinnovo completo del tuo sito esistente.', price: 'Da €149', priceValue: 149, features: ['Restyling', 'Performance', 'Mobile'] },
            { id: 'sitoweb-minecraft-rp', category: 'web-editing', title: 'Sito Web Minecraft/Roleplay', description: 'Sito web dedicato a server Minecraft.', price: 'Da €199', priceValue: 199, features: ['Autenticazione', 'Store', 'Status live'] },
            { id: 'bot-discord', category: 'bot', title: 'Bot Discord', description: 'Bot Discord personalizzato.', price: 'Da €49', priceValue: 49, features: ['Comandi', 'Moderazione'] },
            { id: 'bot-telegram', category: 'bot', title: 'Bot Telegram', description: 'Bot Telegram per community.', price: 'Da €39', priceValue: 39, features: ['Comandi', 'Notifiche'] },
            { id: 'bot-minecraft', category: 'bot', title: 'Plugin Discord-MC', description: 'Bridge Minecraft-Discord.', price: 'Da €29', priceValue: 29, features: ['Chat sync', 'Rich presence'] },
            { id: 'setup-database', category: 'settaggi', title: 'Configurazione Database', description: 'Setup database MySQL/PostgreSQL.', price: 'Da €29', priceValue: 29, features: ['Installazione', 'Backup'] },
            { id: 'setup-discord-server', category: 'settaggi', title: 'Setup Discord Server', description: 'Configurazione server Discord.', price: 'Da €49', priceValue: 49, features: ['Canali', 'Ruoli'] },
            { id: 'setup-vps', category: 'settaggi', title: 'Configurazione VPS', description: 'Setup e ottimizzazione VPS.', price: 'Da €59', priceValue: 59, features: ['Firewall', 'SSL', 'Nginx'] },
            { id: 'setup-web-server', category: 'settaggi', title: 'Setup Web Server', description: 'Configurazione Nginx/Apache.', price: 'Da €49', priceValue: 49, features: ['Server ottimizzato', 'Cache'] },
            { id: 'setup-minecraft-server', category: 'settaggi', title: 'Setup Minecraft Server', description: 'Server Minecraft ottimizzato.', price: 'Da €39', priceValue: 39, features: ['Paper/Spigot', 'Anti-lag'] },
            { id: 'server-minecraft', category: 'server', title: 'Minecraft Hosting', description: 'Hosting server Minecraft.', price: '€5-25/mes', priceValue: 5, features: ['DDoS protection'], plans: [{ name: 'Basic', slots: 10, price: '€5/mes' }, { name: 'Standard', slots: 25, price: '€10/mes' }] },
            { id: 'server-discord', category: 'server', title: 'Discord Server Pro', description: 'Setup server Discord professionale.', price: 'Da €79', priceValue: 79, features: ['Design premium', 'Bot'] },
            { id: 'consulenza-sviluppo', category: 'consulenze', title: 'Consulenza Sviluppo', description: 'Sessione consulenza software.', price: '€30/ora', priceValue: 30, features: ['Code review', 'Architettura'] },
            { id: 'consulenza-infra', category: 'consulenze', title: 'Consulenza Infrastruttura', description: 'Consulenza IT e sicurezza.', price: '€40/ora', priceValue: 40, features: ['Cloud', 'Sicurezza'] },
            { id: 'consulenza-gaming', category: 'consulenze', title: 'Consulenza Gaming', description: 'Per community gaming.', price: '€25/ora', priceValue: 25, features: ['Strategia', 'Monetizzazione'] }
        ];
        
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Seeding products...');
            await Product.insertMany(defaultProducts);
            console.log(`✅ ${defaultProducts.length} products seeded!`);
        } else {
            console.log(`Products: ${count} items`);
        }
    } catch (error) {
        console.error('Seed error:', error.message);
    }
}

// --- Connect & Seed ---

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await seedProducts();
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = { 
    User, 
    Ticket,
    Order,
    Stats, 
    AdminConfig,
    Product,
    getAdminStatus,
    incrementVisitors,
    mongoose 
};
