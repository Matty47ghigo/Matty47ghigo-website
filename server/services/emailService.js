const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'business.matty47ghigo@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Sends an order confirmation email to the customer.
 * @param {Object} order - The order document from MongoDB.
 */
const sendOrderConfirmation = async (order) => {
    const { items, total, billingInfo, orderNumber } = order;

    const itemsHtml = items.map(item => `
        <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-weight: bold;">${item.name} x ${item.quantity}</p>
            <p style="margin: 5px 0 0; color: #666; font-size: 14px;">€ ${item.price.toFixed(2)}</p>
        </div>
    `).join('');

    const mailOptions = {
        from: '"Matty47ghigo Studios" <business.matty47ghigo@gmail.com>',
        to: billingInfo.email,
        subject: `Conferma Ordine #${orderNumber} - Matty47ghigo Studios`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">Grazie per il tuo acquisto!</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Il tuo ordine #${orderNumber} è confermato.</p>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="font-size: 18px; color: #333; margin-top: 0;">Riepilogo Servizi</h2>
                    ${itemsHtml}
                    
                    <div style="padding: 20px 0; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #333;">
                        <span>Totale:</span>
                        <span>€ ${total.toFixed(2)}</span>
                    </div>

                    <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #00d2ff;">
                        <h3 style="margin: 0 0 10px; font-size: 16px; color: #333;">Prossimi Passaggi:</h3>
                        <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                            Per iniziare a lavorare sul tuo progetto, ti chiediamo gentilmente di <strong>aprire un ticket di assistenza</strong> nella tua <a href="${process.env.APP_URL || 'https://matty47ghigo-website.vercel.app'}/dashboard/support" style="color: #3a7bd5; text-decoration: none;">dashboard personale</a> per spiegarci i dettagli e le tue esigenze.
                        </p>
                    </div>

                    <div style="margin-top: 30px; text-align: center;">
                        <a href="${process.env.APP_URL || 'https://matty47ghigo-website.vercel.app'}/dashboard/orders" style="background-color: #333; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">Visualizza Ordine</a>
                    </div>
                </div>
                
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
                    &copy; ${new Date().getFullYear()} Matty47ghigo Studios. Tutti i diritti riservati.
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent for order ${orderNumber}`);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOrderConfirmation };
