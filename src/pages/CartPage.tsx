import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { createOrder, isLoading, error } = useOrderStore();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return;
    }
    
    try {
      await createOrder();
      // Redirect to order confirmation or orders page
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Cart Items ({totalItems})</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCart}
                      className="text-red-500 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Clear Cart
                    </Button>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                  {isAuthenticated ? (
                    <Button 
                      className="w-full" 
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link to="/login?redirect=cart">Login to Checkout</Link>
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        Please login to complete your purchase
                      </p>
                    </>
                  )}
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;