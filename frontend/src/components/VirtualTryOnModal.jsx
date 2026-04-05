import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Sparkles, Loader2, Maximize2 } from 'lucide-react';

export default function VirtualTryOnModal({ isOpen, onClose, product }) {
  const [step, setStep] = useState('upload'); // 'upload', 'processing', 'result'
  const [userImage, setUserImage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(URL.createObjectURL(file));
      setStep('processing');
      // Simulate AI processing time
      setTimeout(() => setStep('result'), 3000);
    }
  };

  const resetProcess = () => {
    setUserImage(null);
    setStep('upload');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-surface w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-[210] w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md shadow-md">
            <X size={20} />
          </button>

          {/* Left Side: Product Details */}
          <div className="w-full md:w-1/3 bg-surface-100 p-6 flex flex-col border-r border-surface-200">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-accent" size={24} />
              <h2 className="text-xl font-bold font-serif text-text-700">AI Virtual Stylist</h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md">
                  <img src={product?.image_url || product?.image} alt={product?.name} className="w-full h-full object-cover" />
               </div>
               <div>
                 <h3 className="font-bold text-text-700">{product?.name}</h3>
                 <p className="text-sm text-text-500">{product?.category}</p>
               </div>
            </div>
            <div className="mt-auto bg-accent/10 border border-accent/20 p-4 rounded-xl">
               <p className="text-xs text-text-700 leading-relaxed font-medium text-center">
                 Our AI intelligently aligns this outfit over your photo to give you a realistic preview of the fit and drape.
               </p>
            </div>
          </div>

          {/* Right Side: Interactive Area */}
          <div className="w-full md:w-2/3 bg-[#f8f9fa] flex flex-col items-center justify-center p-8 relative">
             
             {step === 'upload' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center max-w-sm text-center">
                 <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 text-accent">
                   <Camera size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-text-700 mb-2">Upload your photo</h3>
                 <p className="text-text-500 text-sm mb-8">For the best results, use a full-body photo standing straight with good lighting in fitted clothes.</p>
                 
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                 <button 
                   onClick={() => fileInputRef.current.click()}
                   className="flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full justify-center"
                 >
                   <Upload size={20} /> Browse Photo
                 </button>
               </motion.div>
             )}

             {step === 'processing' && (
               <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles size={32} className="text-accent animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-text-700">Styling in progress...</h3>
                    <p className="text-sm text-text-500 mt-1">Analyzing body landmarks to fit {product?.name}</p>
                  </div>
               </div>
             )}

             {step === 'result' && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[280px] aspect-[3/4] bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-200">
                     {/* Fake Composite Image - user bg, product overlay */}
                     <img src={userImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="You" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                     
                     {/* Simulation of the clothing overlaid on the user */}
                     <motion.img 
                       initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
                       src={product?.image_url || product?.image} 
                       className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[80%] h-auto mix-blend-multiply drop-shadow-2xl" 
                       alt="Overlay" 
                     />
                     
                     <div className="absolute bottom-4 right-4 flex gap-2">
                       <button className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md text-text-700 hover:text-accent border border-white"><Maximize2 size={16} /></button>
                     </div>
                     <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                       <Sparkles size={12} /> AI Gen Result
                     </div>
                  </div>
                  
                  <div className="mt-8 flex gap-4 w-full max-w-[280px]">
                    <button onClick={resetProcess} className="flex-1 py-2.5 border border-surface-200 bg-white text-text-700 text-sm rounded-lg font-medium hover:bg-surface-50 transition-colors shadow-sm">
                      Retry
                    </button>
                    <button onClick={onClose} className="flex-1 py-2.5 bg-accent text-white text-sm rounded-lg font-bold shadow-md hover:bg-opacity-90 transition-colors">
                      Perfect!
                    </button>
                  </div>
               </motion.div>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
