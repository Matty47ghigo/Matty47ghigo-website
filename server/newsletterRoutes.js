const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Newsletter, NewsletterPost } = require('./db');
const {
    sendNewsletterVerificationEmail,
    sendNewsletterWelcomeEmail,
    sendNewsletterPostEmail
} = require('./email');

// @route   POST api/newsletter/subscribe
// @desc    Subscribe an email and send verification link
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email richiesta' });

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            if (existing.isVerified) {
                return res.status(400).json({ message: 'Sei già iscritto alla newsletter!' });
            }
            // Re-send verification if not verified
            const token = crypto.randomBytes(32).toString('hex');
            existing.verificationToken = token;
            await existing.save();
            await sendNewsletterVerificationEmail(email, token);
            return res.json({ message: 'Email di verifica inviata di nuovo. Controlla la tua posta!' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await Newsletter.create({ email, verificationToken: token });
        await sendNewsletterVerificationEmail(email, token);

        res.status(201).json({ message: 'Ti abbiamo inviato un\'email di verifica. Conferma per ricevere il tuo sconto!' });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        res.status(500).json({ message: 'Errore durante l\'iscrizione' });
    }
});

// @route   GET api/newsletter/verify
// @desc    Verify newsletter subscription
router.get('/verify', async (req, res) => {
    const { token } = req.query;
    try {
        const subscriber = await Newsletter.findOne({ verificationToken: token });
        if (!subscriber) return res.status(400).json({ message: 'Token non valido o scaduto.' });

        subscriber.isVerified = true;
        subscriber.verificationToken = undefined;
        await subscriber.save();

        await sendNewsletterWelcomeEmail(subscriber.email);

        res.json({ message: 'Iscrizione confermata! Controlla la tua email per il codice sconto.' });
    } catch (error) {
        console.error('Newsletter verify error:', error);
        res.status(500).json({ message: 'Errore durante la verifica' });
    }
});

// --- ADMIN ROUTES ---

// @route   GET api/newsletter/subscribers
// @desc    Get all subscribers (Admin only)
router.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Errore caricamento iscritti' });
    }
});

// @route   POST api/newsletter/posts
// @desc    Create/Save newsletter post draft
router.post('/posts', async (req, res) => {
    const { title, content } = req.body;
    try {
        const post = await NewsletterPost.create({ title, content });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Errore salvataggio post' });
    }
});

// @route   GET api/newsletter/posts
// @desc    Get all newsletter posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await NewsletterPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Errore caricamento post' });
    }
});

// @route   POST api/newsletter/posts/:id/send
// @desc    Send newsletter post to all verified subscribers
router.post('/posts/:id/send', async (req, res) => {
    try {
        const post = await NewsletterPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post non trovato' });

        const subscribers = await Newsletter.find({ isVerified: true });

        // Send emails in parallel
        const sendPromises = subscribers.map(s =>
            sendNewsletterPostEmail(s.email, post.title, post.content)
        );

        await Promise.all(sendPromises);

        post.status = 'sent';
        post.sentAt = new Date();
        await post.save();

        res.json({ message: `Newsletter inviata con successo a ${subscribers.length} iscritti!` });
    } catch (error) {
        console.error('Newsletter broadcast error:', error);
        res.status(500).json({ message: 'Errore durante l\'invio della newsletter' });
    }
});

// @route   DELETE api/newsletter/posts/:id
// @desc    Delete a newsletter post
router.delete('/posts/:id', async (req, res) => {
    try {
        await NewsletterPost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post eliminato' });
    } catch (error) {
        res.status(500).json({ message: 'Errore eliminazione post' });
    }
});

module.exports = router;
