const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { User, Ticket, Order, Stats, AdminConfig, getAdminStatus, incrementVisitors } = require('./db');
const { sendVerificationEmail, sendTicketClosedEmail, sendAdminNotification } = require('./email');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Middleware ---
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) {
        await incrementVisitors();
    }
    next();
});

// --- Auth Routes ---

app.get('/api/auth/status', async (req, res) => {
    try {
        const config = await getAdminStatus();
        res.json({ isSetup: config.isSetup });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Standard Registration
app.post('/api/auth/register', async (req, res) => {
    const { name, surname, email, password, address, cap } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email già registrata" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            name,
            surname,
            email,
            passwordHash,
            address,
            cap,
            verificationToken,
            provider: 'standard'
        });

        await sendVerificationEmail(email, name, verificationToken);

        res.json({ message: "Registrazione completata! Controlla la tua email per attivare l'account." });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Errore durante la registrazione" });
    }
});

// Email Verification
app.get('/api/auth/verify', async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: "Token non valido o scaduto" });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #00e5ff;">Account Attivato! 🚀</h1>
                <p>Il tuo account è stato verificato con successo. Ora puoi chiudere questa pagina e accedere al sito.</p>
                <a href="http://localhost:5173/login" style="display: inline-block; padding: 10px 20px; background: #00e5ff; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Vai al Login</a>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Errore durante la verifica");
    }
});

// Login (Standard)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Credenziali non valide" });

        if (user.provider === 'standard') {
            if (!user.isVerified) return res.status(403).json({ message: "Si prega di verificare l'email prima di accedere" });
            
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: "Credenziali non valide" });
        } else {
            return res.status(400).json({ message: `Questo account è collegato tramite ${user.provider}. Usa il login social.` });
        }

        user.lastLogin = new Date();
        await user.save();

        res.json({ message: "Login effettuato", user });
    } catch (error) {
        res.status(500).json({ message: "Errore interno" });
    }
});

// Social Auth Upsert Helper
const upsertSocialUser = async (profile) => {
    const isAdmin = profile.email === 'mattiaghigo60@gmail.com';
    return await User.findOneAndUpdate(
        { email: profile.email },
        { 
            name: profile.name,
            surname: profile.surname || '',
            picture: profile.picture,
            provider: profile.provider,
            isAdmin: isAdmin,
            isVerified: true, // Social users are verified by default
            lastLogin: new Date()
        },
        { upsert: true, new: true }
    );
};

// Google Auth
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const user = await upsertSocialUser({
            name: payload.given_name || payload.name,
            surname: payload.family_name || '',
            email: payload.email,
            picture: payload.picture,
            provider: 'google'
        });
        res.json({ message: "Google login successful", user });
    } catch (error) {
        res.status(401).json({ message: "Invalid Google token" });
    }
});

// GitHub Auth
app.post('/api/auth/github', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenRes.data.access_token;
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        // GitHub name is often just a single string
        const fullName = userRes.data.name || userRes.data.login;
        const nameParts = fullName.split(' ');

        const user = await upsertSocialUser({
            name: nameParts[0],
            surname: nameParts.slice(1).join(' '),
            email: userRes.data.email,
            picture: userRes.data.avatar_url,
            provider: 'github'
        });
        res.json({ message: "GitHub login successful", user });
    } catch (error) {
        res.status(500).json({ message: "Errore GitHub" });
    }
});

// Discord Auth
app.post('/api/auth/discord', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:5173/callback'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const user = await upsertSocialUser({
            name: userRes.data.global_name || userRes.data.username,
            surname: '',
            email: userRes.data.email,
            picture: `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`,
            provider: 'discord'
        });
        res.json({ message: "Discord login successful", user });
    } catch (error) {
        res.status(500).json({ message: "Errore Discord" });
    }
});

// --- Platform Routes ---

app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('userId').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets" });
    }
});

app.post('/api/tickets', async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        const user = await User.findById(ticket.userId);
        await sendAdminNotification(user.name, ticket.subject);
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Error creating ticket" });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ lastLogin: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});
        stats.registeredUsers = await User.countDocuments();
        stats.orders = await Order.countDocuments();
        await stats.save();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
