import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext'; // Adjust the path if needed

interface CartItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (artwork: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void; // ✅ NEW
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    axios
      .get("http://localhost:4000/api/cart", { withCredentials: true })
      .then((res) => {
        if (res.data.cart?.items) {
          setCartItems(
            res.data.cart.items.map((item: any) => ({
              id: item.artworkId,
              title: item.title,
              image: item.image,
              price: Number(item.price),
              artist: item.artist || "Unknown",
              quantity: item.quantity || 1,
            }))
          );
        }
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          console.error("Cart load failed", err);
        }
      });
  }, [isAuthenticated, loading]);

  const addToCart = async (artwork: Omit<CartItem, 'quantity'>) => {
    const exists = cartItems.some(item => item.id === artwork.id);
    if (exists) return;

    try {
      const res = await axios.post(`http://localhost:4000/api/cart/add/${artwork.id}`, {}, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setCartItems(prev => [...prev, { ...artwork, quantity: 1 }]);
      }
    } catch (err) {
      toast("Add to cart failed");
    }
  };

  const removeFromCart = async (artworkId: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/cart/remove/${artworkId}`, {
        withCredentials: true,
      });

      setCartItems((prev) => prev.filter(item => item.id !== artworkId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    toast("One artwork can only be added once to the cart", {
      description: "You can only add one copy of each artwork to the cart.",
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 1;
      return total + quantity;
    }, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // ✅ New clearCart method
  const clearCart = () => {
    setCartItems([]); // frontend
    axios.delete("http://localhost:4000/api/cart/clear", { withCredentials: true }) // backend
      .catch((err) => console.error("Failed to clear cart on backend", err));
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      clearCart // ✅ Make it available to consumers
    }}>
      {children}
    </CartContext.Provider>
  );
};
