import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const addItem = (product, quantity = 1) => setItems((current) => {
    const found = current.find((item) => item.id === product.id)
    return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...product, quantity }]
  })
  const updateQuantity = (id, quantity) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0))
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const clear = () => setItems([])
  return <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}