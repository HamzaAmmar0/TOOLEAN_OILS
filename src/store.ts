import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  img: string;
  description: string;
  type: string[];
  concern: string[];
  ingredient: string[];
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Botanical Argan No. 07', price: '$95.00', numericPrice: 95.00, description: "A deeply nourishing pure argan extraction.", img: 'argan', type: ['type_straight', 'type_wavy'], concern: ['concern_frizz', 'concern_dryness'], ingredient: ['ing_argan'], stock: 142 },
  { id: '2', name: 'Marula Silk', price: '$84.00', numericPrice: 84.00, description: "Silky finish for high porosity textures.", img: 'silk', type: ['type_curly', 'type_coily'], concern: ['concern_damage', 'concern_frizz'], ingredient: ['ing_marula'], stock: 28 },
  { id: '3', name: 'Scalp Elixir', price: '$62.00', numericPrice: 62.00, description: "Invigorating root treatment.", img: 'scalp', type: ['type_straight', 'type_wavy', 'type_curly'], concern: ['concern_scalp', 'concern_dryness'], ingredient: ['ing_rosemary'], stock: 300 },
  { id: '4', name: 'Jojoba Balance', price: '$55.00', numericPrice: 55.00, description: "Sebum-matching balancing formula.", img: 'jojoba-oil', type: ['type_wavy', 'type_curly'], concern: ['concern_scalp'], ingredient: ['ing_jojoba'], stock: 0 },
  { id: '5', name: 'Argan + Rose', price: '$110.00', numericPrice: 110.00, description: "Luxurious floral blend.", img: 'rose-oil', type: ['type_coily'], concern: ['concern_damage'], ingredient: ['ing_argan'], stock: 10 },
  { id: '6', name: 'Restorative Blend', price: '$120.00', numericPrice: 120.00, description: "The ultimate overnight rescue.", img: 'blend', type: ['type_straight', 'type_wavy', 'type_curly', 'type_coily'], concern: ['concern_damage', 'concern_dryness'], ingredient: ['ing_marula', 'ing_jojoba'], stock: 55 }
];

interface AppState {
  products: Product[];
  userRole: 'guest' | 'user' | 'admin';
  productViews: { [productId: string]: number };
  
  // Search & Cart Integration
  searchQuery: string;
  cart: CartItem[];
  userProfile: UserProfile;
  
  setSearchQuery: (query: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Profile
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Existing Admin/Analytics
  setRole: (role: 'guest' | 'user' | 'admin') => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  trackProductView: (productId: string) => void;
  addProduct: (product: Product) => void;
}

export const useAppStore = create<AppState>((set) => ({
  products: [...DEFAULT_PRODUCTS],
  userRole: 'guest',
  productViews: {},
  
  searchQuery: '',
  cart: [],
  userProfile: { fullName: '', phone: '', address: '' },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addToCart: (productId) => set((state) => {
    const existing = state.cart.find(item => item.productId === productId);
    if (existing) {
      return { cart: state.cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { productId, quantity: 1 }] };
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.productId !== productId)
  })),
  
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: quantity <= 0 ? state.cart.filter(i => i.productId !== productId) 
                        : state.cart.map(i => i.productId === productId ? { ...i, quantity } : i)
  })),
  
  clearCart: () => set({ cart: [] }),
  
  updateUserProfile: (profile) => set((state) => ({
    userProfile: { ...state.userProfile, ...profile }
  })),
  
  setRole: (role) => set({ userRole: role }),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),

  trackProductView: (productId) => set((state) => ({
    productViews: { ...state.productViews, [productId]: (state.productViews[productId] || 0) + 1 }
  }))
}));
