import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CheckCircle, Package, Truck, Home, MapPin, ChevronLeft, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import authFetch from '../utils/authFetch'

export default function TrackOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      try {
        const response = await authFetch(`/track_order.php?id=${id}`)
        const data = await response.json()
        if (data.status === 'error') {
          setError(data.message)
        } else {
          setOrder(data)
        }
      } catch (err) {
        setError("Failed to load order journey.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const allSteps = [
    { key: 'pending', title: 'Order Confirmed', desc: 'Awaiting dispatch from our boutique.', icon: Package },
    { key: 'shipped', title: 'Shipped', desc: 'In transit with our logistics partner.', icon: Truck },
    { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Our courier is near your destination.', icon: MapPin },
    { key: 'delivered', title: 'Delivered', desc: 'Package received and signed.', icon: Home }
  ]

  const getStepStatus = (stepKey) => {
    if (!order) return 'pending';
    const orderStatus = order.status;
    const stepIndex = allSteps.findIndex(s => s.key === stepKey);
    const orderIndex = allSteps.findIndex(s => s.key === orderStatus);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'pending';
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-text border-t-transparent rounded-full animate-spin"></div></div>
  if (error || !order) return <div className="container mx-auto px-4 py-40 text-center space-y-6"><h2 className="text-3xl font-serif">Journey not found</h2><button onClick={() => navigate(-1)} className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest text-[10px]">Back to Safety</button></div>

  return (
    <div className="bg-surface min-h-screen">
      <section className="pt-24 pb-12 border-b border-muted/10">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4 text-center md:text-left">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted/70 hover:text-text transition uppercase text-[10px] font-bold tracking-widest"><ArrowLeft size={14}/> Back</button>
            <h1 className="text-6xl font-serif font-bold text-text tracking-tighter uppercase leading-none">The Journey</h1>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Tracking ID: #{order.id}</p>
          </div>
          <div className="text-center md:text-right hidden md:block">
            <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest mb-1">Estimated Arrival</p>
            <p className="font-bold text-xl">3-5 Business Days</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Status Timeline */}
          <div className="lg:col-span-7 space-y-12 relative">
            <div className="absolute left-[23px] top-4 bottom-4 w-px bg-muted/10"></div>
            {allSteps.map((step) => (
              <div key={step.key} className="flex gap-8 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${
                  getStepStatus(step.key) === 'completed' ? 'bg-text border-text text-surface' : 
                  getStepStatus(step.key) === 'current' ? 'bg-surface border-text text-text' : 
                  'bg-surface border-muted/20 text-muted/50'
                }`}>
                  {getStepStatus(step.key) === 'completed' ? <CheckCircle size={20}/> : <step.icon size={20} />}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className={`text-lg font-bold ${getStepStatus(step.key) === 'pending' ? 'text-muted/50' : 'text-text'}`}>{step.title}</h4>
                  <p className={`text-sm mt-1 leading-relaxed ${getStepStatus(step.key) === 'pending' ? 'text-muted/30' : 'text-muted/70'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-surface-100 p-8 rounded-none border border-muted/20 space-y-8">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-muted/20 pb-4">Package Content</h3>
               <div className="space-y-6">
                 {order.items && order.items.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-center">
                      <img src={item.image_url} className="w-12 h-16 object-cover bg-surface" />
                      <div className="flex-1">
                        <p className="font-bold text-xs truncate uppercase tracking-widest">{item.name}</p>
                        <p className="text-[10px] font-medium text-muted/70 mt-1">QTY: {item.quantity} | {item.size}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted/70">Destination Info</h3>
               <div className="text-sm space-y-1">
                  <p className="font-bold uppercase tracking-widest">{order.user_name || order.guest_name}</p>
                  <p className="text-muted/70">{order.shipping_address_line1}</p>
                  <p className="text-muted/70 uppercase">{order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}