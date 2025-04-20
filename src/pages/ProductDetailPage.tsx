import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProduct, fetchProductById, addReview, isLoading, error } = useProductStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const handleAddToCart = () => {
    if (currentProduct) {
      addItem(currentProduct, quantity);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setReviewSubmitting(true);
    try {
      await addReview(id, rating, comment);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading product details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const averageRating = currentProduct.reviews && currentProduct.reviews.length > 0
    ? currentProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / currentProduct.reviews.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-[400px]">
            {currentProduct.imageUrl ? (
              <img 
                src={currentProduct.imageUrl} 
                alt={currentProduct.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400">No image available</div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {currentProduct.reviews?.length || 0} reviews
              </span>
            </div>
            
            <p className="text-2xl font-bold mb-4">${currentProduct.price.toFixed(2)}</p>
            
            <p className="text-gray-600 mb-6">{currentProduct.description}</p>
            
            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Category</p>
              <p>{currentProduct.category?.name || 'Uncategorized'}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Availability</p>
              <p className={currentProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {currentProduct.stock > 0 
                  ? `In Stock (${currentProduct.stock} available)` 
                  : 'Out of Stock'}
              </p>
            </div>
            
            {currentProduct.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    max={currentProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button onClick={handleAddToCart} className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="description">
          <TabsList className="mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({currentProduct.reviews?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <p>{currentProduct.description}</p>
          </TabsContent>
          
          <TabsContent value="reviews">
            <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
            
            {isAuthenticated ? (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
                <p className="mb-4">Please log in to write a review.</p>
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            )}
            
            {currentProduct.reviews && currentProduct.reviews.length > 0 ? (
              <div className="space-y-6">
                {currentProduct.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{review.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;