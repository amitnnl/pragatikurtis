import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function ReturnModal({ order, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API delay
    setTimeout(() => {
        onSubmit(order.id, reason)
        setLoading(false)
        onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>
        
        <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" /> Request Return
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Requesting return for Order <strong>#{order.id}</strong>. Please select a reason below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Reason for Return</label>
            <select 
              required
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-black outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="size_issue">Size Issue - Too Small/Big</option>
              <option value="defective">Defective/Damaged Product</option>
              <option value="wrong_item">Received Wrong Item</option>
              <option value="quality_issue">Quality Not As Expected</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800">
            Note: Returns are only accepted within 7 days of delivery. The item must be unused and with original tags.
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
