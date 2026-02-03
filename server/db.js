const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/m47g_studios';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas ---

const UserSchema = new mongoose.Schema({
    name: String,
    surname: String,
    email: { type: String, unique: true },
    passwordHash: String,
    picture: String,
    address: String,
    cap: String,
    provider: { type: String, default: 'standard' }, // google, github, discord, standard
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    linkedAccounts: {
        google: String,
        github: String,
        discord: String
    },
    paymentMethods: [{
        type: { type: String }, // card, paypal
        last4: String,
        brand: String
    }],
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: String,
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    messages: [{
        senderId: mongoose.Schema.Types.ObjectId, // User or Admin (null if system)
        role: { type: String, enum: ['user', 'admin'] },
        content: String,
        date: { type: Date, default: Date.now }
    }],
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
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
    registeredUsers: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const AdminConfigSchema = new mongoose.Schema({
    isSetup: { type: Boolean, default: false },
    passwordHash: String,
    email: { type: String, default: "mattiaghigo60@gmail.com" }
});

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Order = mongoose.model('Order', OrderSchema);
const Stats = mongoose.model('Stats', StatsSchema);
const AdminConfig = mongoose.model('AdminConfig', AdminConfigSchema);

// Helper to get admin status
const getAdminStatus = async () => {
    let config = await AdminConfig.findOne();
    if (!config) {
        config = await AdminConfig.create({});
    }
    return config;
};

// Increment visitor stat
const incrementVisitors = async () => {
    await Stats.findOneAndUpdate({}, { $inc: { visitors: 1 } }, { upsert: true, new: true });
};

module.exports = { 
    User, 
    Ticket,
    Order,
    Stats, 
    AdminConfig,
    getAdminStatus,
    incrementVisitors,
    mongoose 
};
