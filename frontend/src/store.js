import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Cart
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    set({ cart: [...cart] });
  },
  removeFromCart: (productId) => {
    const cart = get().cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    set({ cart });
  },
  updateCartQuantity: (productId, quantity) => {
    const cart = get().cart;
    const item = cart.find(i => i.id === productId);
    if (item) item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    set({ cart: [...cart] });
  },
  clearCart: () => {
    localStorage.setItem('cart', JSON.stringify([]));
    set({ cart: [] });
  },

  // Auth
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  setUser: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  // Filters
  selectedCategory: null,
  selectedSubcategory: null,
  searchQuery: '',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedSubcategory: (subcategory) => set({ selectedSubcategory: subcategory }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
