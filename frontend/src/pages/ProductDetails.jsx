import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
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

  const isWishlisted = wishlist.some(item => item.id == id);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'reviews', 'shipping'

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
    if (product.sizes && !selectedSize) {
      setReviewMessage({ type: 'error', text: 'Please select a size.' });
      return;
    }
    // Use product.color and product.fabric directly for validation
    if (product.color && product.color.split(',').length > 0 && !selectedColor) {
      setReviewMessage({ type: 'error', text: 'Please select a color.' });
      return;
    }
    if (product.fabric && product.fabric.split(',').length > 0 && !selectedFabric) {
      setReviewMessage({ type: 'error', text: 'Please select a fabric.' });
      return;
    }
    onAddToCart({ ...product, quantity, selectedSize, selectedColor, selectedFabric });
    setReviewMessage({ type: 'success', text: `${quantity} x ${product.name} added to cart!` });
  };

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-text-700">Product Not Found</h1>
        <p className="text-muted/70 mt-2">The product you are looking for does not exist.</p>
        <button onClick={() => navigate('/shop')} className="mt-8 px-6 py-3 bg-accent text-surface rounded-lg">Back to Shop</button>
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

  return (
    <div className="bg-surface">
      <SEO 
        title={product.name} 
        description={product.meta_description || product.description} 
        image={product.image_url || product.image}
        url={window.location.href}
        schema={productSchema}
      />
      
      <div className="container mx-auto px-6 pt-28 md:pt-36 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-lg border border-surface-200 bg-surface-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={mainDisplayImage}
                  src={mainDisplayImage}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </AnimatePresence>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.gallery.map((img, index) => (
                <div key={index} className="relative flex-shrink-0 w-20 aspect-[3/4] overflow-hidden rounded-md border border-surface-200 hover:border-accent transition cursor-pointer">
                  <img
                    src={img}
                    alt={`${product.name} gallery ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="text-muted/70 hover:text-text-700 flex items-center gap-2 mb-4"><ChevronLeft size={20}/> Back to Shop</button>
            <h1 className="text-4xl font-serif font-bold text-text-700">{product.name}</h1>
            <p className="text-sm text-muted/70">{product.category} | {product.fabric} | Color: {product.color}</p>
            <p className="text-3xl font-bold text-text-700">₹{product.price}</p>
            
            <div className="flex items-center gap-2 text-text-500">
                <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                    ))}
                </div>
                <span className="text-sm">({reviews.length} reviews) - Avg: {averageRating}</span>
            </div>

            <p className="text-text-700 leading-relaxed">{product.description}</p>

            {/* Size Selector */}
            {product.sizes && (
              <div className="flex items-center gap-4">
                <span className="text-text-700 font-medium">Size:</span>
                <div className="flex gap-2">
                  {product.sizes.split(',').map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size.trim())}
                      className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                        selectedSize === size.trim()
                          ? 'border-accent bg-accent text-surface'
                          : 'border-muted/20 text-text-700 hover:border-accent'
                      }`}
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-text-700 font-medium">Color:</span>
                <div className="flex gap-2">
                  {availableColors.map(colorOption => (
                    <button
                      key={colorOption}
                      onClick={() => setSelectedColor(colorOption)}
                      className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                        selectedColor === colorOption
                          ? 'border-accent bg-accent text-surface'
                          : 'border-muted/20 text-text-700 hover:border-accent'
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
                <span className="text-text-700 font-medium">Fabric:</span>
                <div className="flex gap-2">
                  {availableFabrics.map(fabricOption => (
                    <button
                      key={fabricOption}
                      onClick={() => setSelectedFabric(fabricOption)}
                      className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                        selectedFabric === fabricOption
                          ? 'border-accent bg-accent text-surface'
                          : 'border-muted/20 text-text-700 hover:border-accent'
                      }`}
                    >
                      {fabricOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-text-700 font-medium">Quantity:</span>
              <div className="flex items-center border border-muted/20 rounded-lg">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-2 text-muted/70 hover:text-text-700"><Minus size={16}/></button>
                <span className="px-4 text-text-700">{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)} className="p-2 text-muted/70 hover:text-text-700"><Plus size={16}/></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-center">
              <button onClick={handleAddToCartClick} className="flex-1 px-6 py-3 bg-accent text-surface rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md">
                <ShoppingCart size={20} className="inline-block mr-2"/> Add to Cart
              </button>
              <button onClick={() => onToggleWishlist(product)} className={`p-3 rounded-lg border transition-colors ${isWishlisted ? 'border-danger text-danger bg-danger-soft' : 'border-muted/20 text-muted/70 hover:border-accent hover:text-accent'}`}>
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"}/>
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16 border-b border-muted/20">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('description')} 
              className={`pb-3 text-lg font-medium ${activeTab === 'description' ? 'border-b-2 border-accent text-accent' : 'text-muted/70 hover:text-text-700'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`pb-3 text-lg font-medium ${activeTab === 'reviews' ? 'border-b-2 border-accent text-accent' : 'text-muted/70 hover:text-text-700'}`}
            >
              Reviews ({reviews.length})
            </button>
            <button 
              onClick={() => setActiveTab('shipping')} 
              className={`pb-3 text-lg font-medium ${activeTab === 'shipping' ? 'border-b-2 border-accent text-accent' : 'text-muted/70 hover:text-text-700'}`}
            >
              Shipping & Returns
            </button>
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-text-700 leading-relaxed">{product.description}</p>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-text-700 mb-6">Customer Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="text-muted/70">No reviews yet. Be the first to review this product!</p>
                ) : (
                    <div className="space-y-8">
                        {reviews.map(review => (
                            <div key={review.id} className="pb-4 border-b border-muted/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-text-700">{review.user_name}</h4>
                                    <span className="text-sm text-muted/70">• {new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-accent mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className={i < review.rating ? "" : "text-surface-300"} />
                                    ))}
                                </div>
                                <p className="text-text-700 leading-relaxed">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h3 className="text-xl font-bold text-text-700 mt-12 mb-4">Write a Review</h3>
                {reviewMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${reviewMessage.type === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                    {reviewMessage.text}
                  </div>
                )}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-700 mb-2">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                            <Star className={`w-6 h-6 transition-colors ${newReview.rating >= star ? 'text-accent' : 'text-surface-300'}`} fill="currentColor"/>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-text-700 mb-2">Your Review</label>
                       <textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-accent text-text-700" required></textarea>
                    </div>
                    <button type="submit" disabled={submitting} className="px-6 py-3 bg-accent text-surface font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg text-sm">
                      {submitting ? 'Submitting...' : 'Submit Review'} <Send size={18}/>
                    </button>
                  </form>
                ) : (
                  <p className="text-muted/70 text-sm">You must be logged in to write a review.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-xl font-bold text-text-700 mb-4">Shipping Information</h3>
              <p className="text-text-700 leading-relaxed">
                We offer standard and expedited shipping options. Delivery times vary based on your location.
                Please allow 1-2 business days for order processing before shipment.
              </p>
              <h3 className="text-xl font-bold text-text-700 mt-8 mb-4">Returns & Exchanges</h3>
              <p className="text-text-700 leading-relaxed">
                We accept returns within 30 days of purchase for unused items in their original packaging.
                Please contact our customer service to initiate a return or exchange.
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      <div className="bg-surface-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif text-text-700 mb-8 text-center">Related Products</h2>
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
    </div>
  );
};

export default ProductDetails;