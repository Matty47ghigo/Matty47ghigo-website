const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { readDb, writeDb } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Auth Routes ---

// Check if setup is required
app.get('/api/auth/status', (req, res) => {
    const db = readDb();
    res.json({ isSetup: db.admin.isSetup });
});

// First time setup (create password)
app.post('/api/auth/setup', async (req, res) => {
    const { password, email } = req.body;
    const db = readDb();

    if (db.admin.isSetup) {
        return res.status(400).json({ message: "Setup already completed" });
    }

    if (email !== db.admin.email) {
        return res.status(403).json({ message: "Invalid admin email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    db.admin.passwordHash = hash;
    db.admin.isSetup = true;
    writeDb(db);

    res.json({ message: "Password set successfully. Please login." });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = readDb();

    if (email !== db.admin.email) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!db.admin.isSetup) {
        return res.status(400).json({ message: "Setup not completed. Please set a password first." });
    }

    const isMatch = await bcrypt.compare(password, db.admin.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // In a real app, generate JWT here. For now, just return success.
    res.json({ message: "Login successful", user: { name: "Mattia Ghigo", email: db.admin.email } });
});

// --- Data Routes ---

app.get('/api/stats', (req, res) => {
    const db = readDb();
    res.json(db.stats);
});

app.get('/api/messages', (req, res) => {
    const db = readDb();
    res.json(db.messages);
});

app.get('/api/users', (req, res) => {
    const db = readDb();
    res.json(db.users);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
