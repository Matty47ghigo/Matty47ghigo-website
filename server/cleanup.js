const mongoose = require('mongoose');
const { Order, Stats } = require('./db');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected for cleanup');
        await Order.deleteMany({});
        await Stats.findOneAndUpdate({}, { orders: 0 }, { upsert: true });
        console.log('Orders cleaned successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
