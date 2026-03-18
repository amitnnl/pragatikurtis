import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, User, MapPin } from 'lucide-react';
import authFetch from '../utils/authFetch';
import { UPLOADS_BASE_URL } from '../config';

const OrderDetailsModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) return;
        
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await authFetch(`/orders.php?id=${orderId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order details.');
                }
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'delivered': return 'bg-success-soft text-success';
            case 'cancelled': return 'bg-danger-soft text-danger';
            case 'shipped': return 'bg-info-soft text-info';
            case 'processing': return 'bg-accent-light text-accent';
            default: return 'bg-warning-soft text-warning';
        }
    }

    return (
        <AnimatePresence>
            {orderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.9, opacity: 0 }} 
                        className="bg-surface p-6 md:p-8 rounded-2xl w-full max-w-3xl relative shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-text-500 hover:text-text-700 transition-colors"><X /></button>

                        {loading ? (
                            <p className="text-center py-16">Loading order details...</p>
                        ) : error ? (
                            <p className="text-center py-16 text-danger">{error}</p>
                        ) : order && (
                            <div>
                                <div className="border-b border-surface-200 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-text-700">Order Details</h2>
                                    <p className="text-sm text-muted/70">Order #{order.id} • Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-text-700 flex items-center gap-2"><User size={16}/> Customer</h3>
                                        <p className="text-sm text-muted/70">{order.guest_name || order.user_full_name}<br/>{order.guest_email || order.user_email_registered}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-text-700 flex items-center gap-2"><MapPin size={16}/> Shipping Address</h3>
                                        <p className="text-sm text-muted/70">
                                            {order.shipping_address_line1}, {order.shipping_address_line2 ? `${order.shipping_address_line2},` : ''}<br/>
                                            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-text-700 mb-4 flex items-center gap-2"><Package size={16}/> Items</h3>
                                    <div className="space-y-3 border border-surface-200 rounded-lg p-4">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <img src={`${UPLOADS_BASE_URL}/${item.product_image}`} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg"/>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-text-700 text-sm">{item.product_name}</p>
                                                    <p className="text-xs text-muted/70">Qty: {item.quantity} • Size: {item.size}</p>
                                                </div>
                                                <p className="font-semibold text-sm text-text-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-surface-200">
                                    <div>
                                        <p className="font-semibold text-text-700">Payment</p>
                                        <p className="text-sm text-muted/70">Method: {order.payment_method}</p>
                                        <p className="text-sm text-muted/70">Status: <span className={getStatusColor(order.status)}>{order.status}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-text-700">Order Total</p>
                                        <p className="text-2xl font-bold text-text-700">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
