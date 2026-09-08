import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronLeft, Send, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import Tilt3D from '../components/Tilt3D';
import SEO from '../components/SEO';
import VirtualTryOnModal from '../components/VirtualTryOnModal';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config';
import authFetch from '../utils/authFetch';

const ProductDetails = ({ products, onAddToCart, onToggleWishlist, wishlist, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id == id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [mainDisplayImage, setMainDisplayImage] = useState('');
  const [availableColors, setAvailableColors] = useState([]); // New state
  const [availableFabrics, setAvailableFabrics] = useState([]); // New state

  const { settings } = useSettings();

  // New states for Bulk Order & Custom Measurements
  const [bulkQuantities, setBulkQuantities] = useState({});
  const [isCustomStitching, setIsCustomStitching] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({ bust: '', waist: '', hips: '', length: '' });
  const isDealer = user?.role === 'dealer' && user?.is_approved == 1;

  const isWishlisted = wishlist.some(item => item.id == id);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'reviews', 'shipping'
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null); // For success/error messages after review submission

  useEffect(() => {
    if (product) {
        fetchReviews();
        if (product.sizes) {
          setSelectedSize(product.sizes.split(',')[0].trim());
        }
        
        // Parse colors and fabrics and set state
        const colors = product.color ? product.color.split(',').map(c => c.trim()) : [];
        const fabrics = product.fabric ? product.fabric.split(',').map(f => f.trim()) : [];
        setAvailableColors(colors);
        setAvailableFabrics(fabrics);

        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }
        if (fabrics.length > 0) {
          setSelectedFabric(fabrics[0]);
        }

        // Initialize main display image
        setMainDisplayImage(product.image);
    }
  }, [product, user]);

  useEffect(() => {
    if (product && product.variant_images && selectedColor && selectedFabric) {
      const variantKey = `${selectedColor}-${selectedFabric}`;
      if (product.variant_images[variantKey]) {
        setMainDisplayImage(product.variant_images[variantKey]);
      } else {
        // Fallback to main product image if specific variant image not found
        setMainDisplayImage(product.image);
      }
    } else if (product) {
      setMainDisplayImage(product.image);
    }
  }, [product, selectedColor, selectedFabric]);

  const fetchReviews = async () => {
    try {
        // Assuming there's an API endpoint to get reviews for a specific product
        const response = await authFetch(`/admin_reviews.php?product_id=${product.id}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data.filter(r => r.is_approved == 1)); // Display only approved reviews
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage({ type: 'error', text: 'You must be logged in to submit a review.' });
      return;
    }
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      setReviewMessage({ type: 'error', text: 'Please provide a rating and a comment.' });
      return;
    }

    setSubmitting(true);
    setReviewMessage(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/admin_reviews.php`, { // This needs to be submit_review.php
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: product.id,
          user_id: user.id,
          user_name: user.name,
          rating: newReview.rating,
          comment: newReview.comment,
          is_approved: 0 // Reviews need admin approval
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setReviewMessage({ type: 'success', text: 'Review submitted for approval!' });
        setNewReview({ rating: 0, comment: '' });
        // No need to refetch reviews immediately as it's not approved yet
      } else {
        throw new Error(data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setReviewMessage({ type: 'error', text: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCartClick = () => {
    // Validate Colors/Fabrics first
    if (product.color && product.color.split(',').length > 0 && !selectedColor) {
      setReviewMessage({ type: 'error', text: 'Please select a color.' });
      return;
    }
    if (product.fabric && product.fabric.split(',').length > 0 && !selectedFabric) {
      setReviewMessage({ type: 'error', text: 'Please select a fabric.' });
      return;
    }

    if (isDealer) {
      // B2B Bulk Order Logic
      const itemsToAdd = [];
      let totalQty = 0;
      Object.entries(bulkQuantities).forEach(([size, qty]) => {
        if (qty > 0) {
          itemsToAdd.push({
            ...product, selectedSize: size, selectedColor, selectedFabric, quantity: qty
          });
          totalQty += qty;
        }
      });
      
      if (itemsToAdd.length === 0) {
        setReviewMessage({ type: 'error', text: 'Please enter a quantity for at least one size in the matrix.' });
        return;
      }
      onAddToCart(itemsToAdd);
      setReviewMessage({ type: 'success', text: `Added ${totalQty} items to bag!` });
      setBulkQuantities({}); // Reset after adding
    } else {
      // B2C Retail Logic
      if (product.sizes && !selectedSize) {
        setReviewMessage({ type: 'error', text: 'Please select a size.' });
        return;
      }
      
      if (isCustomStitching) {
         if (!customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips) {
           setReviewMessage({ type: 'error', text: 'Please provide at least your Bust, Waist, and Hips measurements.' });
           return;
         }
      }
      
      onAddToCart({ 
        ...product, 
        quantity, 
        selectedSize, 
        selectedColor, 
        selectedFabric,
        customMeasurements: isCustomStitching ? customMeasurements : null,
        isCustomStitching
      });
      setReviewMessage({ type: 'success', text: `${quantity} x ${product.name} added to cart!` });
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-serif font-medium text-text-dark">Piece Not Found</h1>
        <p className="text-text-muted mt-2">The artisanal piece you are looking for is currently unavailable or has moved.</p>
        <button onClick={() => navigate('/shop')} className="mt-8 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold text-sm tracking-wider uppercase shadow-md transition-all">
          Explore The Collection
        </button>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / reviews.length).toFixed(1) : 'N/A';

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url || product.image,
    "description": product.meta_description || product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  if (reviews.length > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviews.length
    };
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${product.name}`,
          text: `I found this beautiful ${product.category} on pragatikurtis!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setReviewMessage({ type: 'success', text: 'Link copied to clipboard!' });
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <SEO 
        title={product.name} 
        description={product.meta_description || product.description} 
        image={product.image_url || product.image}
        url={window.location.href}
        schema={productSchema}
      />
      
      <div className="container mx-auto px-6 pt-28 md:pt-36 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* 3D Product Image Showcase */}
          <div>
            <Tilt3D maxTilt={6} perspective={1200} glareOpacity={0.25} className="rounded-2xl">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-card border border-border-soft bg-soft-surface group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={mainDisplayImage}
                    src={mainDisplayImage}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </AnimatePresence>

                {/* 3D Floating Pure Craftsmanship Badge */}
                <div 
                  className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-secondary/30 shadow-md text-[11px] font-semibold tracking-wider text-primary uppercase flex items-center gap-1.5"
                  style={{ transform: 'translateZ(26px)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Pure Craftsmanship
                </div>

                {product.fabric && (
                  <div 
                    className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-text-dark/80 backdrop-blur-md text-white/90 text-[10px] font-medium tracking-widest uppercase shadow-sm"
                    style={{ transform: 'translateZ(24px)' }}
                  >
                    {product.fabric}
                  </div>
                )}
              </div>
            </Tilt3D>

            {/* Thumbnails Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 scrollbar-thin">
                {product.gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainDisplayImage(img)}
                    className={`relative flex-shrink-0 w-20 aspect-[3/4] overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
                      mainDisplayImage === img
                        ? 'border-primary ring-2 ring-secondary/50 shadow-md scale-105'
                        : 'border-border-soft hover:border-secondary hover:scale-102 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} gallery ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* AI Virtual Try-On Button with 3D Elevation */}
            {settings?.feature_virtual_try_on !== '0' && (
              <button 
                onClick={() => setIsTryOnOpen(true)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-primary to-primary-dark hover:shadow-gold-glow hover:-translate-y-0.5 active:scale-95 text-white font-semibold rounded-xl tracking-wide transition-all shadow-md group"
              >
                <Sparkles className="text-secondary-light group-hover:rotate-12 transition-transform duration-300" size={18} />
                <span>AI Virtual Try-On</span>
                <span className="text-[10px] bg-secondary text-text-dark font-bold px-2 py-0.5 rounded-full ml-2 shadow-sm">BETA</span>
              </button>
            )}
          </div>

          {/* Product Details Column */}
          <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="text-text-muted hover:text-primary flex items-center gap-2 mb-2 font-medium text-xs tracking-wider uppercase transition-colors">
              <ChevronLeft size={16}/> Back to Collection
            </button>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-serif font-medium text-text-dark leading-tight">{product.name}</h1>
                <p className="text-xs md:text-sm text-text-muted mt-2 tracking-wider uppercase font-medium">
                  {product.category} <span className="text-secondary mx-1.5">•</span> {product.fabric} <span className="text-secondary mx-1.5">•</span> Color: {product.color}
                </p>
              </div>
              <button 
                onClick={handleShare}
                className="p-3 rounded-full bg-soft-surface text-text-muted hover:text-primary hover:bg-white border border-border-soft transition-all shrink-0 hover:scale-110 active:scale-95 shadow-sm"
                aria-label="Share product"
              >
                <Share2 size={18} />
              </button>
            </div>
            
            <p className="text-3xl md:text-4xl font-serif font-bold text-primary">₹{product.price}</p>
            
            <div className="flex items-center gap-2 text-text-muted">
              <div className="flex text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs font-semibold tracking-wider">({reviews.length} reviews) • Avg: {averageRating}</span>
            </div>

            <p className="text-text-muted text-sm md:text-base leading-relaxed font-light">{product.description}</p>

            {/* Dealer Bulk Matrix VS Retail Size */}
            {isDealer ? (
              <div className="space-y-4 bg-soft-surface p-5 rounded-2xl border border-secondary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-dark font-bold text-sm tracking-wide">Bulk Order Matrix</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-primary text-white px-2.5 py-1 rounded-full shadow-sm">Dealer Access</span>
                </div>
                {product.sizes ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {product.sizes.split(',').map(size => {
                       const s = size.trim();
                       return (
                         <div key={s} className="flex flex-col gap-1.5">
                           <label className="text-xs text-text-muted font-bold text-center">Size {s}</label>
                           <input 
                             type="number" min="0" placeholder="0"
                             value={bulkQuantities[s] || ''}
                             onChange={(e) => setBulkQuantities({...bulkQuantities, [s]: parseInt(e.target.value) || 0})}
                             className="w-full text-center border border-border-soft rounded-xl py-2 px-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow font-medium bg-white"
                           />
                         </div>
                       );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-w-[150px]">
                     <label className="text-xs text-text-muted font-bold">Quantity</label>
                     <input 
                       type="number" min="1" placeholder="1"
                       value={bulkQuantities['Standard'] || ''}
                       onChange={(e) => setBulkQuantities({...bulkQuantities, 'Standard': parseInt(e.target.value) || 0})}
                       className="w-full border border-border-soft rounded-xl py-2 px-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow font-medium bg-white"
                     />
                  </div>
                )}
              </div>
            ) : (
              <>
                {product.sizes && (
                  <div className="flex items-center gap-4">
                    <span className="text-text-dark font-medium text-sm whitespace-nowrap min-w-[70px]">Size:</span>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.split(',').map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size.trim())}
                          className={`px-4 py-2 border rounded-xl text-xs tracking-wider uppercase font-semibold transition-all duration-200 active:scale-95 ${
                            selectedSize === size.trim()
                              ? 'border-primary bg-primary text-white shadow-gold-glow scale-105'
                              : 'border-border-soft text-text-dark hover:border-primary/40 hover:bg-soft-surface'
                          }`}
                        >
                          {size.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Custom Measurements (Retail Only) */}
                {settings?.feature_custom_stitching !== '0' && (
                  <div className="bg-soft-surface border border-border-soft rounded-2xl p-4 mt-2 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isCustomStitching ? 'bg-primary border-primary' : 'border-border-soft bg-white'}`}>
                      {isCustomStitching && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isCustomStitching}
                      onChange={(e) => setIsCustomStitching(e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium text-text-dark">Need Custom Fit / Alterations? (+₹150)</span>
                  </label>
                  
                  <AnimatePresence>
                    {isCustomStitching && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4 mt-5">
                          {[
                            { name: 'bust', label: 'Bust (inches)' },
                            { name: 'waist', label: 'Waist (inches)' },
                            { name: 'hips', label: 'Hips (inches)' },
                            { name: 'length', label: 'Total Length' }
                          ].map(field => (
                             <div key={field.name}>
                               <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1.5">{field.label}</label>
                               <input 
                                 type="text" 
                                 placeholder="e.g. 36"
                                 value={customMeasurements[field.name]}
                                 onChange={(e) => setCustomMeasurements({...customMeasurements, [field.name]: e.target.value})}
                                 className="w-full text-sm border border-border-soft rounded-xl p-2.5 focus:border-primary outline-none bg-white transition-colors"
                               />
                             </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-sale mt-4 bg-sale/5 p-2.5 rounded-lg border border-sale/10">* Note: Custom stitched items are final sale and non-refundable.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )}
              </>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-text-dark font-medium text-sm">Color:</span>
                <div className="flex gap-2">
                  {availableColors.map(colorOption => (
                    <button
                      key={colorOption}
                      onClick={() => setSelectedColor(colorOption)}
                      className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold tracking-wider transition-all active:scale-95 ${
                        selectedColor === colorOption
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border-soft text-text-dark hover:border-secondary hover:bg-soft-surface'
                      }`}
                    >
                      {colorOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric Selector */}
            {availableFabrics.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-text-dark font-medium text-sm">Fabric:</span>
                <div className="flex gap-2">
                  {availableFabrics.map(fabricOption => (
                    <button
                      key={fabricOption}
                      onClick={() => setSelectedFabric(fabricOption)}
                      className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold tracking-wider transition-all active:scale-95 ${
                        selectedFabric === fabricOption
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border-soft text-text-dark hover:border-secondary hover:bg-soft-surface'
                      }`}
                    >
                      {fabricOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector - Retail Only. Dealers use matrix. */}
            {!isDealer && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-text-dark font-medium text-sm whitespace-nowrap min-w-[70px]">Quantity:</span>
                <div className="flex items-center border border-border-soft rounded-xl overflow-hidden bg-white shadow-sm">
                  <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-3 text-text-muted hover:text-text-dark hover:bg-soft-surface transition-colors"><Minus size={15}/></button>
                  <span className="px-5 font-semibold text-text-dark text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(prev => prev + 1)} className="p-3 text-text-muted hover:text-text-dark hover:bg-soft-surface transition-colors"><Plus size={15}/></button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 items-center pt-2">
              <button onClick={handleAddToCartClick} className="flex-1 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold tracking-wider uppercase text-xs hover:shadow-3d active:scale-95 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <ShoppingCart size={18}/> Add to Bag
              </button>
              <button 
                onClick={() => onToggleWishlist(product)} 
                className={`p-4 rounded-xl border transition-all active:scale-95 hover:scale-105 ${
                  isWishlisted 
                    ? 'border-sale text-sale bg-sale/10 shadow-sm' 
                    : 'border-border-soft text-text-muted hover:border-primary hover:text-primary hover:bg-soft-surface'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"}/>
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16 border-b border-border-soft">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('description')} 
              className={`pb-3 text-base font-semibold tracking-wide transition-colors ${activeTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-dark'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`pb-3 text-base font-semibold tracking-wide transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-dark'}`}
            >
              Reviews ({reviews.length})
            </button>
            <button 
              onClick={() => setActiveTab('shipping')} 
              className={`pb-3 text-base font-semibold tracking-wide transition-colors ${activeTab === 'shipping' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-dark'}`}
            >
              Shipping & Returns
            </button>
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-text-muted leading-relaxed font-light max-w-3xl">{product.description}</p>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="max-w-2xl">
                <h3 className="text-2xl font-serif font-medium text-text-dark mb-6">Customer Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="text-text-muted font-light">No reviews yet. Be the first to review this artisanal creation!</p>
                ) : (
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="pb-4 border-b border-border-soft">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-text-dark text-sm">{review.user_name}</h4>
                                    <span className="text-xs text-text-muted">• {new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-secondary mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={15} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className={i < review.rating ? "" : "text-border-soft"} />
                                    ))}
                                </div>
                                <p className="text-text-muted text-sm leading-relaxed font-light">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h3 className="text-xl font-serif font-medium text-text-dark mt-12 mb-4">Write a Review</h3>
                {reviewMessage && (
                  <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${reviewMessage.type === 'success' ? 'bg-success-soft text-success border border-success/20' : 'bg-danger-soft text-danger border border-danger/20'}`}>
                    {reviewMessage.text}
                  </div>
                )}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                            <Star className={`w-6 h-6 transition-colors ${newReview.rating >= star ? 'text-secondary fill-secondary' : 'text-border-soft'}`}/>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">Your Review</label>
                       <textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-3.5 border border-border-soft rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark outline-none bg-white transition-all text-sm" required></textarea>
                    </div>
                    <button type="submit" disabled={submitting} className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center gap-2">
                      {submitting ? 'Submitting...' : 'Submit Review'} <Send size={15}/>
                    </button>
                  </form>
                ) : (
                  <p className="text-text-muted text-sm font-light">Please log in to share your experience with this piece.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-lg font-serif font-medium text-text-dark mb-2">Shipping Information</h3>
                <p className="text-text-muted leading-relaxed font-light text-sm">
                  We provide complimentary insured standard delivery across India. Handcrafted pieces typically ship within 24-48 business hours with live tracking updates.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-text-dark mb-2">Returns & Exchanges</h3>
                <p className="text-text-muted leading-relaxed font-light text-sm">
                  We offer a hassle-free 7-day exchange window for unstitched or unaltered garments with intact tags and original luxury packaging.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      <div className="bg-soft-surface py-16 border-t border-border-soft">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-2">Curated Complements</p>
          <h2 className="text-3xl md:text-4xl font-serif text-text-dark mb-10 text-center">You May Also Admire</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(relatedProduct => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct} 
                onAddToCart={onAddToCart} 
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.some(item => item.id === relatedProduct.id)}
                user={user}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Try-On Modal */}
      <VirtualTryOnModal 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetails;