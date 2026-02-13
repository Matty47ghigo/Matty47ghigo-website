import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [couponDetails, setCouponDetails] = useState(null);
    const [userId, setUserId] = useState(null);

    // Get user ID and sync cart
    useEffect(() => {
        const syncCart = () => {
            const storedUser = localStorage.getItem('user');
            let currentUserId = null;
            
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    currentUserId = user._id || user.id;
                    setUserId(currentUserId);
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            } else {
                setUserId(null);
                // Important: If we were previously logged in, clear state on logout
                // This ensures Guest doesn't see the previous user's cart in memory
                if (userId !== null) {
                    setCart([]);
                    setCoupon(null);
                    setCouponDetails(null);
                }
            }

            // Generate cart key based on user ID
            const cartKey = currentUserId ? `cart_${currentUserId}` : 'cart_guest';
            const savedCart = localStorage.getItem(cartKey);
            
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    setCart(parsedCart);
                } catch (e) {
                    console.error('Error parsing cart:', e);
                    setCart([]);
                }
            } else {
                // If no cart in storage for this (new) user/guest, reset state
                setCart([]);
            }

            // Also sync coupon
            const couponKey = currentUserId ? `cartCoupon_${currentUserId}` : 'cartCoupon_guest';
            const savedCoupon = localStorage.getItem(couponKey);
            if (savedCoupon) {
                setCoupon(savedCoupon);
                
                const couponDetailsKey = currentUserId ? `cartCouponDetails_${currentUserId}` : 'cartCouponDetails_guest';
                const savedCouponDetails = localStorage.getItem(couponDetailsKey);
                if (savedCouponDetails) {
                    try {
                        setCouponDetails(JSON.parse(savedCouponDetails));
                    } catch (e) {
                        setCouponDetails(null);
                    }
                }
            } else {
                setCoupon(null);
                setCouponDetails(null);
            }
        };

        syncCart();
        
        // Listen for user changes
        const interval = setInterval(syncCart, 1000);
        window.addEventListener('storage', syncCart);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', syncCart);
        };
    }, [userId]);

    // Save cart when it changes
    useEffect(() => {
        const cartKey = userId ? `cart_${userId}` : 'cart_guest';
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart, userId]);

    // Save coupon when it changes
    useEffect(() => {
        const couponKey = userId ? `cartCoupon_${userId}` : 'cartCoupon_guest';
        if (coupon) {
            localStorage.setItem(couponKey, coupon);
        } else {
            localStorage.removeItem(couponKey);
        }
    }, [coupon, userId]);

    // Save coupon details when it changes
    useEffect(() => {
        const couponDetailsKey = userId ? `cartCouponDetails_${userId}` : 'cartCouponDetails_guest';
        if (couponDetails) {
            localStorage.setItem(couponDetailsKey, JSON.stringify(couponDetails));
        } else {
            localStorage.removeItem(couponDetailsKey);
        }
    }, [couponDetails, userId]);

    const getCartKey = useCallback(() => {
        return userId ? `cart_${userId}` : 'cart_guest';
    }, [userId]);

    const addToCart = (product, quantity = 1, options = {}) => {
        setCart(prevCart => {
            const productId = product.id || product._id;
            const existingItemIndex = prevCart.findIndex(
                item => (item.id || item._id) === productId && JSON.stringify(item.options) === JSON.stringify(options)
            );

            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            }

            // Add product image based on title
            const productImage = getProductImage(product.title || product.name);
            
            return [...prevCart, { 
                ...product, 
                id: productId, // Ensure we have id
                name: product.title || product.name, // Ensure we have name
                quantity, 
                options, 
                image: productImage || product.image 
            }];
        });
    };

    const removeFromCart = (productId, options = {}) => {
        setCart(prevCart => 
            prevCart.filter(item => !((item.id || item._id) === productId && JSON.stringify(item.options) === JSON.stringify(options)))
        );
    };

    const updateQuantity = (productId, quantity, options = {}) => {
        if (quantity < 1) {
            removeFromCart(productId, options);
            return;
        }

        setCart(prevCart => {
            return prevCart.map(item => {
                if ((item.id || item._id) === productId && JSON.stringify(item.options) === JSON.stringify(options)) {
                    return { ...item, quantity };
                }
                return item;
            });
        });
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
        setCouponDetails(null);
    };

    const applyCoupon = async (couponCode) => {
        try {
            const response = await fetch('/api/shop/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: couponCode }),
            });

            const data = await response.json();

            if (data.valid) {
                setCoupon(couponCode);
                setCouponDetails(data.coupon);
                return { success: true, message: data.message, discount: data.coupon };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Errore durante la validazione del coupon' };
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponDetails(null);
    };

    const getSubtotal = () => {
        return cart.reduce((total, item) => {
            const price = item.onSale && item.salePrice ? item.salePrice : item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const getDiscount = () => {
        if (!couponDetails) return 0;
        const subtotal = getSubtotal();
        if (couponDetails.type === 'percentage') {
            return subtotal * (couponDetails.value / 100);
        } else if (couponDetails.type === 'fixed') {
            return Math.min(couponDetails.value, subtotal);
        }
        return 0;
    };

    const getTotal = () => {
        return Math.max(0, getSubtotal() - getDiscount());
    };

    const getItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Helper function to get product image based on title
    const getProductImage = (title) => {
        if (!title) return null;
        const titleLower = title.toLowerCase();
        if (titleLower.includes('minecraft')) return '/assets/images/15.jpeg';
        if (titleLower.includes('database')) return '/assets/images/5.jpeg';
        if (titleLower.includes('discord')) return '/assets/images/23.jpeg';
        if (titleLower.includes('telegram')) return '/assets/images/19.jpeg';
        if (titleLower.includes('web') || titleLower.includes('sitoweb') || titleLower.includes('server web')) return '/assets/images/11.jpeg';
        if (titleLower.includes('vps') || titleLower.includes('hosting') || (titleLower.includes('server') && !titleLower.includes('discord'))) return '/assets/images/18.jpeg';
        return '/assets/images/1.jpeg';
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        coupon,
        couponDetails,
        getSubtotal,
        getDiscount,
        getTotal,
        getItemCount,
        getProductImage,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
