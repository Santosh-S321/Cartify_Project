import { createContext, useContext, useState } from "react";

// Create context
const CartContext = createContext();

// Hook to use Cart
export function useCart() {
  return useContext(CartContext);
}

// Provider
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Add item
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  // Remove item
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}