import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: string;
  img: string;
  type: string[];
  concern: string[];
  ingredient: string[];
  stock: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Botanical Argan No. 07', price: '$95.00', img: 'argan', type: ['type_straight', 'type_wavy'], concern: ['concern_frizz', 'concern_dryness'], ingredient: ['ing_argan'], stock: 142 },
  { id: '2', name: 'Marula Silk', price: '$84.00', img: 'silk', type: ['type_curly', 'type_coily'], concern: ['concern_damage', 'concern_frizz'], ingredient: ['ing_marula'], stock: 28 },
  { id: '3', name: 'Scalp Elixir', price: '$62.00', img: 'scalp', type: ['type_straight', 'type_wavy', 'type_curly'], concern: ['concern_scalp', 'concern_dryness'], ingredient: ['ing_rosemary'], stock: 300 },
  { id: '4', name: 'Jojoba Balance', price: '$55.00', img: 'jojoba-oil', type: ['type_wavy', 'type_curly'], concern: ['concern_scalp'], ingredient: ['ing_jojoba'], stock: 0 },
  { id: '5', name: 'Argan + Rose', price: '$110.00', img: 'rose-oil', type: ['type_coily'], concern: ['concern_damage'], ingredient: ['ing_argan'], stock: 10 },
  { id: '6', name: 'Restorative Blend', price: '$120.00', img: 'blend', type: ['type_straight', 'type_wavy', 'type_curly', 'type_coily'], concern: ['concern_damage', 'concern_dryness'], ingredient: ['ing_marula', 'ing_jojoba'], stock: 55 }
];

interface AppState {
  products: Product[];
  userRole: 'guest' | 'user' | 'admin';
  productViews: { [productId: string]: number };
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
