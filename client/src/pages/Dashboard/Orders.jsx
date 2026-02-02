import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Orders = () => {
    return (
        <div>
            <h2><ShoppingCart /> Ordini Clienti</h2>
            <p>Nessun ordine presente al momento.</p>
        </div>
    );
};

export default Orders;
