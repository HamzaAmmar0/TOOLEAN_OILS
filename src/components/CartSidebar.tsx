import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store';
import { translations, Language } from '../i18n';

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  lang,
  onCheckout 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  lang: Language;
  onCheckout: () => void;
}) {
  const { cart, products, updateCartQuantity, removeFromCart } = useAppStore();
  const t = translations[lang];

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(i => i.product);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.numericPrice * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-overlay z-50 transition-colors"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: lang === 'AR' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'AR' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 ${lang === 'AR' ? 'left-0' : 'right-0'} w-full md:w-[400px] bg-brand-card shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-ink/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="font-serif text-xl uppercase tracking-widest text-brand-ink">Cart</h2>
                <span className="bg-brand-ink text-brand-bg text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-ink/50 opacity-60">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-serif text-lg">Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <img 
                      src={`https://picsum.photos/seed/${item.product.img}/100/100`} 
                      className="w-20 h-20 object-cover bg-brand-image rounded grayscale mix-blend-multiply dark:mix-blend-screen"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-sm leading-tight text-brand-ink">{item.product.name}</h4>
                        <span className="text-brand-ink text-sm font-bold">${(item.product.numericPrice * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-brand-ink/20 rounded">
                          <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="p-1 px-2 hover:bg-brand-ink/5"><Minus size={12} /></button>
                          <span className="text-xs w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="p-1 px-2 hover:bg-brand-ink/5"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-[10px] uppercase tracking-widest text-brand-ink/50 hover:text-red-500 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-brand-ink/10 bg-brand-bg/50">
                <div className="flex justify-between items-center mb-6 text-brand-ink">
                  <span className="text-sm tracking-widest uppercase opacity-60">Subtotal</span>
                  <span className="font-serif text-2xl">${subtotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full bg-brand-ink text-brand-bg py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors flex items-center justify-center gap-3"
                >
                  Proceed to Checkout <ShoppingBag size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
