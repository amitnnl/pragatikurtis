import { useRef, useEffect, useState } from 'react'
import { X, Printer } from 'lucide-react'

export default function Invoice({ order, onClose }) {
  const invoiceRef = useRef()
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('store_settings'));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handlePrint = () => {
    window.print()
  }

  const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = parseFloat(order.shipping_amount || 0);
  const totalTax = parseFloat(order.tax_amount || 0);
  const total = parseFloat(order.total_amount);

  // Parse tax_details if it's a string (from API)
  const taxDetails = typeof order.tax_details === 'string' ? JSON.parse(order.tax_details) : order.tax_details;

  const COMPANY_STATE = settings.state || "Maharashtra"; 
  const customerState = order.shipping_state;
  const isInterState = taxDetails ? (taxDetails.type === 'inter') : (customerState && customerState.toLowerCase() !== COMPANY_STATE.toLowerCase());

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0 print:absolute">
      <div className="bg-white w-full max-w-3xl min-h-[80vh] p-8 md:p-12 shadow-2xl relative print:shadow-none print:w-full" ref={invoiceRef}>
        <button onClick={onClose} className="absolute top-4 right-4 print:hidden p-2 hover:bg-gray-100 rounded-full"><X /></button>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">{settings.shortName || 'PRAGATI'}</h1>
            <p className="text-sm text-gray-500">{settings.address || '123 Fashion Street, Mumbai, Maharashtra, 400001'}</p>
            {/* Assuming GSTIN would also be a setting */}
            <p className="text-sm text-gray-500 font-bold mt-1">GSTIN: {settings.gst_number || '27AABCU9603R1ZN'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl text-gray-300 font-bold uppercase">Tax Invoice</h2>
            <p className="text-sm font-bold mt-2">Inv #{order.id}</p>
            <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Place of Supply: {order.shipping_state}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12 flex justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</h3>
            <p className="font-bold text-lg">{order.guest_name || order.user_name}</p>
            <p className="text-gray-600">{order.guest_email || order.user_email}</p>
            <p className="text-gray-600">{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p className="text-gray-600">{order.shipping_address_line2}</p>}
            <p className="text-gray-600">{order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
            {(order.gst_number || order.user_gst_number) && <p className="text-gray-600 font-bold mt-1">GSTIN: {order.gst_number || order.user_gst_number}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12">
          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">HSN</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items && order.items.map((item, i) => (
              <tr key={i}>
                <td className="p-4">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">Size: {item.size}</p>
                </td>
                <td className="p-4 text-sm text-gray-500">{item.hsn_code || '-'}</td>
                <td className="p-4 text-center text-sm">{item.quantity}</td>
                <td className="p-4 text-right text-sm">₹{item.price}</td>
                <td className="p-4 text-right font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-100 pt-8">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            
            {taxDetails ? (
               taxDetails.type === 'inter' ? (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>IGST ({taxDetails.igst_rate}%)</span>
                    <span>₹{parseFloat(taxDetails.igst).toFixed(2)}</span>
                  </div>
               ) : (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>CGST ({taxDetails.cgst_rate}%)</span>
                      <span>₹{parseFloat(taxDetails.cgst).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>SGST ({taxDetails.sgst_rate}%)</span>
                      <span>₹{parseFloat(taxDetails.sgst).toFixed(2)}</span>
                    </div>
                  </>
               )
            ) : (
              isInterState ? (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IGST ({((totalTax / (subTotal || 1)) * 100).toFixed(0)}%)</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>CGST ({((totalTax / 2 / (subTotal || 1)) * 100).toFixed(0)}%)</span>
                    <span>₹{(totalTax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>SGST ({((totalTax / 2 / (subTotal || 1)) * 100).toFixed(0)}%)</span>
                    <span>₹{(totalTax / 2).toFixed(2)}</span>
                  </div>
                </>
              )
            )}

            <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-3 mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-400 print:bottom-4">
          <p>Thank you for your business. For support, email {settings.email || 'support@pragatikurtis.com'}</p>
        </div>

        {/* Print Actions */}
        <div className="absolute top-4 left-4 flex gap-2 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800"><Printer size={16} /> Print</button>
        </div>
      </div>
    </div>
  )
}
