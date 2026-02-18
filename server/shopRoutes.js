const express = require('express');
const router = express.Router();
const { Order, User } = require('./db');
const Stripe = require('stripe');
const { verifyToken, isAdmin } = require('./authMiddleware');

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

// ============ STRIPE CHECKOUT ROUTES ============
const { sendOrderConfirmation } = require('./services/emailService');
const payPalService = require('./services/payPalService');

// Helper to get or create Stripe customer
const finalizeOrder = async (order) => {
    if (order.status === 'completed' && !order.emailSent) {
        console.log(`Sending confirmation email for order ${order.orderNumber}`);
        const result = await sendOrderConfirmation(order);
        if (result.success) {
            order.emailSent = true;
            await order.save();
        }
    }
};

const getOrCreateStripeCustomer = async (userId, billingInfo) => {
    if (!userId) return null;

    const user = await User.findById(userId);
    if (!user) return null;

    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
        email: billingInfo.email,
        name: `${billingInfo.firstName || ''} ${billingInfo.lastName || ''}`.trim() || user.name,
        metadata: {
            userId: userId.toString()
        }
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return customer.id;
};

// Create Stripe Checkout Session (one-time payment)
router.post('/checkout/create-session', async (req, res) => {
    try {
        const {
            items,
            billingInfo,
            userId,
            couponCode,
            stripePromotionCode,
            discount: discountAmount // Aliasing discount from frontend to discountAmount
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Il carrello è vuoto' });
        }

        // Build line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    description: item.options && Object.keys(item.options).length > 0
                        ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')
                        : undefined,
                    // Filter images to only include absolute URLs
                    images: item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))
                        ? [item.image]
                        : undefined,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity || 1,
        }));

        // Generate order number
        const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const subtotal = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
        const total = Math.max(0, subtotal - (discountAmount || 0));

        // Create pending order in database
        const order = await Order.create({
            orderNumber,
            userId: userId || null,
            items: items.map(item => ({
                productId: item.productId || item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image,
                options: item.options || {}
            })),
            billingInfo,
            paymentMethod: 'stripe',
            subtotal,
            discount: discountAmount || 0,
            total,
            couponCode: couponCode || null,
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes to pay
            metadata: {
                stripeCustomerEmail: billingInfo.email
            }
        });

        // Get or create Stripe Customer
        const stripeCustomerId = await getOrCreateStripeCustomer(userId, billingInfo);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            ...(discountAmount >= subtotal ? {} : {
                payment_method_types: ['card', 'customer_balance'],
                payment_method_options: {
                    customer_balance: {
                        funding_type: 'bank_transfer',
                        bank_transfer: {
                            type: 'eu_bank_transfer', // SEPA
                        },
                    },
                },
            }),
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.APP_URL || 'https://matty47ghigo-studios.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
            cancel_url: `${process.env.APP_URL || 'https://matty47ghigo-studios.vercel.app'}/checkout/cancel?order_id=${order._id}`,
            ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: billingInfo.email }),
            metadata: {
                orderId: order._id.toString(),
                orderNumber: orderNumber
            },
            billing_address_collection: 'required',
            ...(stripePromotionCode ? {
                discounts: [{ promotion_code: stripePromotionCode }]
            } : couponCode ? {
                discounts: [{ coupon: couponCode }]
            } : {
                allow_promotion_codes: true
            })
        });

        res.json({
            sessionId: session.id,
            url: session.url,
            orderId: order._id
        });
    } catch (error) {
        console.error('Stripe checkout session error:', error);
        res.status(500).json({ error: 'Errore creazione sessione pagamento: ' + error.message });
    }
});

// Create Stripe Checkout Session (subscription)
router.post('/checkout/create-subscription', async (req, res) => {
    try {
        const {
            items,
            billingInfo,
            userId,
            billingPeriod, // 'month' or 'year'
            couponCode,
            stripePromotionCode,
            discount
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Nessun prodotto selezionato' });
        }

        if (items.length > 1) {
            return res.status(400).json({ error: 'Per le sottoscrizioni è possibile selezionare un solo prodotto' });
        }

        const item = items[0];
        const periodDays = billingPeriod === 'year' ? 365 : 30;

        // Generate order number
        const orderNumber = 'SUB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const subtotal = item.price;
        const total = Math.max(0, subtotal - (discount || 0));

        // Create pending subscription order in database
        const order = await Order.create({
            orderNumber,
            userId: userId || null,
            items: [{
                productId: item.productId || item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image,
                options: { ...(item.options || {}), billingPeriod: billingPeriod }
            }],
            billingInfo,
            paymentMethod: 'stripe_subscription',
            subtotal,
            discount: discount || 0,
            total,
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            metadata: {
                stripeCustomerEmail: billingInfo.email,
                billingPeriod: billingPeriod
            }
        });

        // Get or create Stripe Customer
        const stripeCustomerId = await getOrCreateStripeCustomer(userId, billingInfo);

        // In production, you would create Stripe products and prices first
        // For now, we create a checkout session with custom data
        const session = await stripe.checkout.sessions.create({
            ...(discount >= subtotal ? {} : { payment_method_types: ['card'] }),
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name + ` (${billingPeriod === 'year' ? 'Annuale' : 'Mensile'})`,
                        description: item.description || 'Sottoscrizione ricorrente',
                        // Filter images to only include absolute URLs
                        images: item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))
                            ? [item.image]
                            : undefined,
                    },
                    unit_amount: Math.round(item.price * 100),
                    recurring: {
                        interval: billingPeriod === 'year' ? 'year' : 'month'
                    }
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.APP_URL || 'https://matty47ghigo-studios.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
            cancel_url: `${process.env.APP_URL || 'https://matty47ghigo-studios.vercel.app'}/checkout/cancel?order_id=${order._id}`,
            ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: billingInfo.email }),
            metadata: {
                orderId: order._id.toString(),
                orderNumber: orderNumber,
                billingPeriod: billingPeriod
            },
            billing_address_collection: 'required',
            ...(stripePromotionCode ? {
                discounts: [{ promotion_code: stripePromotionCode }]
            } : couponCode ? {
                discounts: [{ coupon: couponCode }]
            } : {
                allow_promotion_codes: true
            })
        });

        res.json({
            sessionId: session.id,
            url: session.url,
            orderId: order._id
        });
    } catch (error) {
        console.error('Stripe subscription session error:', error);
        res.status(500).json({ error: 'Errore creazione sessione sottoscrizione: ' + error.message });
    }
});

// ============ PAYPAL CHECKOUT ROUTES ============

// Create PayPal Order
router.post('/paypal/create-order', async (req, res) => {
    try {
        const { items, billingInfo, userId, discount: discountAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Il carrello è vuoto' });
        }

        const subtotal = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
        const total = Math.max(0, subtotal - (discountAmount || 0));

        // Generate order number
        const orderNumber = 'ORD-PY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        // Create pending order in database
        const order = await Order.create({
            orderNumber,
            userId: userId || null,
            items: items.map(item => ({
                productId: item.productId || item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image,
                options: item.options || {}
            })),
            billingInfo,
            paymentMethod: 'paypal',
            subtotal,
            discount: discountAmount || 0,
            total,
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        if (total > 0) {
            const paypalOrder = await payPalService.createOrder(total);

            // Link PayPal order ID to our order
            order.paymentId = paypalOrder.id;
            await order.save();

            res.json({
                id: paypalOrder.id,
                orderId: order._id
            });
        } else {
            // Free order handling
            order.status = 'completed';
            order.paymentId = 'free_order_paypal_intent';
            order.completedAt = new Date();
            await order.save();

            // Send confirmation email
            await finalizeOrder(order);

            res.json({
                id: 'FREE_ORDER',
                orderId: order._id,
                free: true
            });
        }
    } catch (error) {
        console.error('PayPal create order error:', error);
        res.status(500).json({ error: 'Errore creazione ordine PayPal: ' + error.message });
    }
});

// Capture PayPal Order
router.post('/paypal/capture-order', async (req, res) => {
    try {
        const { paypalOrderId, orderId } = req.body;

        const captureData = await payPalService.captureOrder(paypalOrderId);

        if (captureData.status === 'COMPLETED') {
            // Update order status in database
            const order = await Order.findByIdAndUpdate(orderId, {
                status: 'completed',
                completedAt: new Date()
            }, { new: true });

            if (order) {
                console.log(`Finalizing PayPal order ${order.orderNumber}`);
                await finalizeOrder(order);
            }

            res.json(captureData);
        } else {
            res.status(400).json({ error: 'Pagamento PayPal non completato', status: captureData.status });
        }
    } catch (error) {
        console.error('PayPal capture order error:', error);
        res.status(500).json({ error: 'Errore finalizzazione pagamento PayPal: ' + error.message });
    }
});

// Helper: Get internal order ID by payment ID
router.get('/orders/by-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const order = await Order.findOne({ paymentId });

        if (!order) {
            return res.status(404).json({ error: 'Ordine non trovato' });
        }

        res.json({ orderId: order._id });
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero ordine' });
    }
});

// Verify Stripe Checkout Session
router.get('/checkout/verify-session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent', 'subscription']
        });

        const orderId = session.metadata?.orderId;
        let order = null;

        if (orderId && (session.payment_status === 'paid' || session.amount_total === 0)) {
            // Update order status to completed
            order = await Order.findByIdAndUpdate(orderId, {
                status: 'completed',
                paymentId: session.payment_intent?.id || session.subscription?.id || 'free_order',
                completedAt: new Date()
            }, { new: true });

            if (order && order.status === 'completed') {
                // Send confirmation email if not already sent
                console.log(`Finalizing order ${order.orderNumber} via success page verification`);
                await finalizeOrder(order);
            }
        }

        res.json({
            status: session.payment_status,
            customerEmail: session.customer_details?.email,
            amountTotal: session.amount_total,
            orderId: orderId,
            subscriptionId: session.subscription?.id,
            subscriptionStatus: session.subscription?.status,
            orderStatus: order?.status || 'pending'
        });
    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({ error: 'Errore verifica sessione' });
    }
});

// Stripe Webhook Handler
router.post('/webhook/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log('Received Stripe Webhook. Signature present:', !!sig);

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
            const session = event.data.object;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                const order = await Order.findByIdAndUpdate(orderId, {
                    status: 'completed',
                    paymentId: session.payment_intent || session.subscription,
                    completedAt: new Date()
                }, { new: true });

                if (order) {
                    console.log(`Order ${order.orderNumber} marked as completed (Event: ${event.type})`);
                    await finalizeOrder(order);
                }
            }
            break;

        case 'checkout.session.async_payment_failed':
            const failedSession = event.data.object;
            const failedOrderId = failedSession.metadata?.orderId;
            if (failedOrderId) {
                console.log(`Async payment failed for order ${failedOrderId}`);
                // Optional: validare e inviare email di fallimento
                await Order.findByIdAndUpdate(failedOrderId, {
                    status: 'cancelled', // o 'payment_failed'
                    notes: 'Bank transfer failed'
                });
            }
            break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            // Handle subscription updates
            console.log('Subscription event:', event.type, subscription.id);
            break;

        case 'customer.subscription.deleted':
            const canceledSub = event.data.object;
            console.log('Subscription canceled:', canceledSub.id);
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Invoice paid:', invoice.id);
            break;

        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            console.log('Invoice payment failed:', failedInvoice.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// ============ EXISTING CART & ORDER ROUTES ============

// Cart sync from client
router.post('/cart/sync', async (req, res) => {
    try {
        const { items, cartId } = req.body;

        // If user is logged in via header, save cart to user
        const userId = req.headers['x-user-id'];

        if (userId) {
            // Save pending cart as order draft
            let existingDraft = await Order.findOne({
                userId,
                status: 'pending',
                expiresAt: { $gt: new Date() }
            });

            if (existingDraft) {
                existingDraft.items = items;
                existingDraft.expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
                await existingDraft.save();
                return res.json({ cartId: existingDraft._id, order: existingDraft });
            }

            const newOrder = await Order.create({
                userId,
                items,
                status: 'pending',
                expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            });

            return res.json({ cartId: newOrder._id, order: newOrder });
        }

        // Return without saving if not logged in
        res.json({ cartId: cartId || null });
    } catch (error) {
        console.error('Cart sync error:', error);
        res.status(500).json({ message: 'Errore sincronizzazione carrello' });
    }
});

// Create order (main endpoint called from checkout)
router.post('/orders', async (req, res) => {
    try {
        const {
            userId,
            items,
            billingInfo,
            paymentMethod,
            subtotal,
            discount,
            total,
            couponCode
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Il carrello è vuoto' });
        }

        // Generate order number
        const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const order = await Order.create({
            orderNumber,
            userId: userId || null,
            items: items.map(item => ({
                productId: item.productId || item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image,
                options: item.options || {}
            })),
            billingInfo,
            paymentMethod,
            subtotal,
            discount: discount || 0,
            total,
            couponCode: couponCode || null,
            status: 'pending',
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days to pay
        });

        // If userId provided, update user info
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                lastOrderId: order._id,
                lastOrderDate: new Date()
            });
        }

        res.json({
            success: true,
            order: order
        });
    } catch (error) {
        console.error('Order create error:', error);
        res.status(500).json({ message: 'Errore creazione ordine: ' + error.message });
    }
});

// Create order (legacy endpoint)
router.post('/orders/create', async (req, res) => {
    try {
        const { userId, items, total, billing, couponCode } = req.body;

        // Generate order number
        const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const order = await Order.create({
            orderNumber,
            userId: userId || null,
            items,
            total,
            billingInfo: billing,
            paymentMethod: 'pending',
            subtotal: total,
            discount: 0,
            status: 'pending',
            couponCode,
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });

        // If userId provided, update user info
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                address: billing.address,
                cap: billing.cap
            });
        }

        res.json({
            success: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            expiresAt: order.expiresAt
        });
    } catch (error) {
        console.error('Order create error:', error);
        res.status(500).json({ message: 'Errore creazione ordine' });
    }
});

// Get user orders
router.get('/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Errore recupero ordini' });
    }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }

        // Check if user owns order or is admin
        if (order.userId && order.userId._id.toString() !== userId) {
            // Check if user is admin
            const user = await User.findById(userId);
            if (!user || !user.isAdmin) {
                return res.status(403).json({ message: 'Non autorizzato' });
            }
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Errore recupero ordine' });
    }
});

// Update order status (admin)
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.headers['x-user-id'];

        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Solo admin può modificare gli ordini' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Errore aggiornamento ordine' });
    }
});

// Get all orders (admin)
router.get('/admin/orders', verifyToken, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Errore recupero ordini' });
    }
});

// ============ COUPON ROUTES ============

// Get all coupons (admin)
router.get('/admin/coupons', verifyToken, isAdmin, async (req, res) => {
    try {
        const stripeCoupons = await stripe.coupons.list({ limit: 100 });
        res.json({ coupons: stripeCoupons.data });
    } catch (error) {
        console.error('Get coupons error:', error);
        // Return empty list if Stripe is not configured
        res.json({ coupons: [], error: 'Stripe non configurato' });
    }
});

// Create coupon (admin)
router.post('/admin/coupons/create', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            code,
            type,
            value,
            duration,
            maxRedemptions,
            minAmount,
            currency
        } = req.body;

        // Build Stripe coupon data
        const couponData = {
            duration: duration === 'once' ? 'once' : duration === 'repeating' ? 'repeating' : 'forever',
            max_redemptions: maxRedemptions || undefined,
        };

        // Set either percentage or fixed amount off
        if (type === 'percentage') {
            couponData.percent_off = value;
        } else {
            couponData.amount_off = Math.round(value * 100); // Convert to cents
            couponData.currency = currency || 'eur';
        }

        // For repeating duration, default to 3 months
        if (duration === 'repeating') {
            couponData.duration_in_months = 3;
        }

        // Create the coupon in Stripe
        try {
            // Using the code as the ID so it's user-friendly
            couponData.id = code.toUpperCase();

            const stripeCoupon = await stripe.coupons.create(couponData);

            // Create promotion code for the coupon
            const promotionCode = await stripe.promotionCodes.create({
                coupon: stripeCoupon.id,
                code: code.toUpperCase(),
                max_redemptions: maxRedemptions || undefined,
            });

            res.json({
                success: true,
                message: 'Coupon creato con successo su Stripe',
                coupon: {
                    id: stripeCoupon.id,
                    code: code.toUpperCase(),
                    promotion_code_id: promotionCode.id,
                    percent_off: stripeCoupon.percent_off,
                    amount_off: stripeCoupon.amount_off,
                    currency: stripeCoupon.currency,
                    max_redemptions: stripeCoupon.max_redemptions,
                    times_redeemed: stripeCoupon.times_redeemed,
                    created: stripeCoupon.created
                }
            });
        } catch (stripeError) {
            console.error('Stripe coupon creation error:', stripeError);
            res.status(500).json({
                error: 'Errore Stripe: ' + stripeError.message
            });
        }
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ message: 'Errore creazione coupon' });
    }
});

// Delete coupon (admin)
router.delete('/admin/coupons/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const couponId = req.params.id;

        // Delete from Stripe
        try {
            await stripe.coupons.del(couponId);
            res.json({
                success: true,
                message: 'Coupon eliminato con successo'
            });
        } catch (stripeError) {
            console.error('Stripe delete error:', stripeError);
            res.status(500).json({
                error: 'Errore Stripe: ' + stripeError.message
            });
        }
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ message: 'Errore eliminazione coupon' });
    }
});

// Validate coupon (for checkout)
router.post('/coupons/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.json({ valid: false, message: 'Codice non inserito' });
        }

        // First check Stripe for the coupon code
        try {
            // Search for promotion codes
            const promotionCodes = await stripe.promotionCodes.list({
                code: code.toUpperCase(),
                active: true,
                expand: ['data.coupon']
            });

            if (promotionCodes.data.length > 0) {
                const promoCode = promotionCodes.data[0];
                const coupon = promoCode.coupon;

                if (coupon.percent_off) {
                    return res.json({
                        valid: true,
                        coupon: {
                            type: 'percentage',
                            value: coupon.percent_off,
                            stripeId: promoCode.id,
                            code: promoCode.code
                        },
                        message: `Sconto del ${coupon.percent_off}% applicato!`
                    });
                } else if (coupon.amount_off) {
                    return res.json({
                        valid: true,
                        coupon: {
                            type: 'fixed',
                            value: coupon.amount_off / 100,
                            stripeId: promoCode.id,
                            code: promoCode.code
                        },
                        message: `Sconto di ${(coupon.amount_off / 100).toFixed(2)}€ applicato!`
                    });
                }
            }
        } catch (stripeError) {
            console.log('Stripe coupon lookup failed:', stripeError.message);
        }

        // No fallback - only valid Stripe coupons are accepted
        res.json({ valid: false, message: 'Codice sconto non valido o scaduto' });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ message: 'Errore validazione coupon' });
    }
});

module.exports = router;
