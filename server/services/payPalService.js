const axios = require('axios');

const PAYPAL_API = 'https://api-m.paypal.com'; // Use live API

const getAccessToken = async () => {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    try {
        const response = await axios({
            url: `${PAYPAL_API}/v1/oauth2/token`,
            method: 'post',
            data: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('PayPal Access Token error:', error.response?.data || error.message);
        throw new Error('Could not get PayPal access token');
    }
};

const createOrder = async (amount) => {
    const accessToken = await getAccessToken();
    try {
        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders`,
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: amount.toFixed(2)
                    }
                }]
            }
        });
        return response.data;
    } catch (error) {
        console.error('PayPal Create Order error:', error.response?.data || error.message);
        throw new Error('Could not create PayPal order');
    }
};

const captureOrder = async (orderId) => {
    const accessToken = await getAccessToken();
    try {
        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('PayPal Capture Order error:', error.response?.data || error.message);
        throw new Error('Could not capture PayPal order');
    }
};

module.exports = {
    createOrder,
    captureOrder
};
