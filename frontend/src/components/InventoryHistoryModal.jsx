import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import authFetch from '../utils/authFetch';

export default function InventoryHistoryModal({ productId, productName, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await authFetch(`/inventory_history.php?product_id=${productId}`);
          const data = await response.json();
          setHistory(data);
        } catch (err) {
          console.error("Error fetching inventory history:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [productId]);

  const getReasonText = (reason, orderId) => {
    switch (reason) {
      case 'new_order':
        return `Order #${orderId}`;
      case 'stock_update':
        return 'Manual Update';
      case 'initial_stock':
        return 'Initial Stock';
      case 'return':
        return `Return for Order #${orderId}`;
      default:
        return reason;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Inventory History</h3>
        <p className="text-gray-600 mb-6">Product: <span className="font-medium">{productName}</span></p>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p>No history found for this product.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="py-3 px-6">Date</th>
                  <th scope="col" className="py-3 px-6">Change</th>
                  <th scope="col" className="py-3 px-6">Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map(entry => (
                  <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6">{new Date(entry.created_at).toLocaleString()}</td>
                    <td className={`py-4 px-6 font-bold ${entry.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.quantity_change > 0 ? `+${entry.quantity_change}` : entry.quantity_change}
                    </td>
                    <td className="py-4 px-6">{getReasonText(entry.reason, entry.order_id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </motion.div>
    </div>
  );
}
