const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'business.matty47ghigo@gmail.com',
        pass: 'exlq omdo yzkh wfoq' // User provided App Password
    }
});

const APP_URL = 'http://localhost:5173';

const sendVerificationEmail = async (email, name, token) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #050505; padding: 30px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">M47G STUDIOS</h1>
        </div>
        <div style="padding: 40px; line-height: 1.6; color: #333333;">
            <h2 style="color: #050505; margin-top: 0;">Benvenuto, ${name}!</h2>
            <p>Grazie per esserti registrato su M47G Studios. Per attivare il tuo account e iniziare a esplorare la tua dashboard, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${APP_URL}/verify?token=${token}" style="display: inline-block; padding: 14px 30px; background-color: #00e5ff; color: #050505; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);">Attiva Account</a>
            </div>
            <p style="font-size: 14px; color: #666;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #007BFF;">${APP_URL}/verify?token=${token}</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eeeeee;">
            © 2026 M47G Studios. Tutti i diritti riservati.<br>
            Inviato da local-dev-environment
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"M47G Studios" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: 'Attiva il tuo account su M47G Studios 🚀',
        html
    });
};

const sendTicketClosedEmail = async (email, name, ticketId) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #050505; padding: 30px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 28px; font-weight: 800;">ASSISTENZA M47G</h1>
        </div>
        <div style="padding: 40px; line-height: 1.6; color: #333333;">
            <h2 style="color: #050505; margin-top: 0;">Il tuo ticket è stato risolto!</h2>
            <p>Ciao <strong>${name}</strong>,</p>
            <p>Ti informiamo che l'amministratore ha chiuso il tuo ticket di assistenza. Speriamo che il problema sia stato risolto in modo soddisfacente.</p>
            
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
            
            <p style="text-align: center; font-weight: 700; color: #050505; font-size: 18px;">Cosa ne pensi del nostro supporto?</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=1" style="text-decoration: none; font-size: 35px; margin: 0 5px;">⭐</a>
                <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=2" style="text-decoration: none; font-size: 35px; margin: 0 5px;">⭐</a>
                <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=3" style="text-decoration: none; font-size: 35px; margin: 0 5px;">⭐</a>
                <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=4" style="text-decoration: none; font-size: 35px; margin: 0 5px;">⭐</a>
                <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=5" style="text-decoration: none; font-size: 35px; margin: 0 5px;">⭐</a>
            </div>
            
            <div style="text-align: center;">
                <a href="${APP_URL}/dashboard/assistenza" style="display: inline-block; padding: 12px 25px; background-color: #050505; color: #00e5ff; text-decoration: none; border-radius: 5px; font-weight: bold; border: 1px solid #00e5ff;">Lascia un commento dettagliato</a>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            Inviato da business.matty47ghigo@gmail.com - Supporto M47G Studios
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"Supporto M47G Studios" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: 'Il tuo ticket è stato chiuso - Come siamo andati?',
        html
    });
};

const sendAdminNotification = async (userName, ticketSubject) => {
    await transporter.sendMail({
        from: '"System M47G" <business.matty47ghigo@gmail.com>',
        to: 'mattiaghigo60@gmail.com', // Admin Email
        subject: 'Nuovo Ticket di Assistenza ricevuto!',
        text: `L'utente ${userName} ha aperto un nuovo ticket: "${ticketSubject}". Controlla la tua dashboard admin.`
    });
};

module.exports = {
    sendVerificationEmail,
    sendTicketClosedEmail,
    sendAdminNotification
};
