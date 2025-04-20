import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/" className="text-lg font-medium">Home</Link>
              <Link to="/products" className="text-lg font-medium">Products</Link>
              <Link to="/categories" className="text-lg font-medium">Categories</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="text-lg font-medium">My Account</Link>
                  <Link to="/orders" className="text-lg font-medium">My Orders</Link>
                  <Button variant="ghost" onClick={logout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-lg font-medium">Login</Link>
                  <Link to="/register" className="text-lg font-medium">Register</Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">Camera Shop</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-foreground/80">Home</Link>
          <Link to="/products" className="transition-colors hover:text-foreground/80">Products</Link>
          <Link to="/categories" className="transition-colors hover:text-foreground/80">Categories</Link>
        </nav>
        
        <div className="flex-1 flex justify-center px-4">
          <form onSubmit={handleSearch} className="w-full max-w-sm flex">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <p className="font-medium">Hello, {user?.name}</p>
                  <Link to="/account" className="text-sm">My Account</Link>
                  <Link to="/orders" className="text-sm">My Orders</Link>
                  <Button variant="outline" onClick={logout}>Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;