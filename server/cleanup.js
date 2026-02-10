// Cleanup script - Eseguire per cancellare tutti i dati dal database
//用法: node cleanup.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://matty47ghigo:Matty47ghigo231747@studios.ionqjua.mongodb.net/';

async function cleanup() {
    try {
        console.log('Connessione a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connesso!\n');

        console.log('Cancellazione dati...');

        // Usa i modelli inline per evitare problemi di import
        const UserSchema = new mongoose.Schema({});
        const TicketSchema = new mongoose.Schema({});
        const OrderSchema = new mongoose.Schema({});
        const StatsSchema = new mongoose.Schema({});
        const AdminConfigSchema = new mongoose.Schema({});
        const ProductSchema = new mongoose.Schema({});

        const User = mongoose.model('User', UserSchema);
        const Ticket = mongoose.model('Ticket', TicketSchema);
        const Order = mongoose.model('Order', OrderSchema);
        const Stats = mongoose.model('Stats', StatsSchema);
        const AdminConfig = mongoose.model('AdminConfig', AdminConfigSchema);
        const Product = mongoose.model('Product', ProductSchema);

        // Cancella tutto
        await User.deleteMany({});
        console.log('✅ Utenti cancellati');

        await Ticket.deleteMany({});
        console.log('✅ Ticket cancellati');

        await Order.deleteMany({});
        console.log('✅ Ordini cancellati');

        await Stats.deleteMany({});
        console.log('✅ Stats cancellate');

        await AdminConfig.deleteMany({});
        console.log('✅ AdminConfig cancellata');

        await Product.deleteMany({});
        console.log('✅ Prodotti cancellati');

        console.log('\n🎉 Database pulito con successo!');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Errore:', error.message);
        process.exit(1);
    }
}

cleanup();
