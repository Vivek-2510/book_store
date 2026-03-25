import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('bookstore_cart') || '[]'))

  useEffect(() => {
    localStorage.setItem('bookstore_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (book, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === book._id)
      if (existing) {
        const newQty = existing.qty + qty
        if (newQty > book.stock) { toast.error('Not enough stock'); return prev }
        toast.success('Cart updated!')
        return prev.map(i => i._id === book._id ? { ...i, qty: newQty } : i)
      }
      toast.success(`${book.title} added to cart!`)
      return [...prev, { ...book, qty }]
    })
  }

  const removeFromCart = (bookId) => {
    setItems(prev => prev.filter(i => i._id !== bookId))
    toast.success('Removed from cart')
  }

  const updateQty = (bookId, qty) => {
    if (qty < 1) { removeFromCart(bookId); return }
    setItems(prev => prev.map(i => i._id === bookId ? { ...i, qty } : i))
  }

  const clearCart = () => setItems([])

  const totalItems    = items.reduce((s, i) => s + i.qty, 0)
  const subtotal      = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingCost  = subtotal >= 499 ? 0 : (items.length > 0 ? 49 : 0)
  const total         = subtotal + shippingCost

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, subtotal, shippingCost, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
