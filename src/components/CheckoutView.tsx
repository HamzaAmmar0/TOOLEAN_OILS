import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { translations, Language } from '../i18n';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { auth } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function CheckoutView({ 
  lang, 
  onBack 
}: { 
  lang: Language; 
  onBack: () => void;
}) {
  const { cart, products, userProfile, updateUserProfile, clearCart } = useAppStore();
  const t = translations[lang];
  const [user] = auth ? useAuthState(auth) : [null];

  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || user?.displayName || '',
    phone: userProfile.phone || '',
    address: userProfile.address || ''
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(i => i.product);

  const total = cartItems.reduce((sum, item) => sum + (item.product.numericPrice * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) return;

    // Save profile locally
    updateUserProfile(formData);

    // Generate WhatsApp Text
    const itemsText = cartItems.map(i => `${i.quantity}x ${i.product.name}`).join('%0A');
    const msg = `*New Order: Tolean Hair Care*%0A%0A*Customer:* ${formData.fullName}%0A*Phone:* ${formData.phone}%0A*Address:* ${formData.address}%0A%0A*Items:*%0A${itemsText}%0A%0A*Total:* $${total.toFixed(2)}`;
    
    // Fake Backend Sync
    // setDoc(doc(db, 'orders', randomId), { ...data, status: 'pending' })
    
    setIsSuccess(true);
    clearCart();

    // Trigger WhatsApp
    setTimeout(() => {
      window.open(`https://wa.me/1234567890?text=${msg}`, '_blank');
      onBack();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex-grow flex flex-col items-center justify-center p-10 text-center"
      >
        <CheckCircle2 size={64} className="text-brand-accent mb-6" />
        <h2 className="font-serif text-4xl mb-4">Order Received</h2>
        <p className="text-brand-ink/60 mb-8 max-w-md">Your elegant hair care selection is being prepared. We are redirecting you to WhatsApp to complete your payment.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex-grow max-w-4xl mx-auto w-full p-4 md:p-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm tracking-widest uppercase text-brand-ink/60 hover:text-brand-ink mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Shopping
      </button>

      <h1 className="font-serif text-4xl mb-10">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest uppercase font-bold opacity-60">Full Name</label>
            <input 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="bg-transparent border-b border-brand-ink/20 py-3 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Jane Doe"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest uppercase font-bold opacity-60">Phone Number</label>
            <input 
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-transparent border-b border-brand-ink/20 py-3 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest uppercase font-bold opacity-60">Shipping Address</label>
            <input 
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-transparent border-b border-brand-ink/20 py-3 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="123 Luxury Ave, CA 90210"
            />
          </div>

          <button 
            type="submit"
            disabled={cartItems.length === 0}
            className="mt-8 w-full bg-brand-ink text-brand-bg py-5 text-[11px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            Confirm & Pay via WhatsApp
          </button>
        </form>

        {/* Summary */}
        <div className="bg-brand-card p-6 md:p-8 border border-brand-ink/5">
          <h3 className="font-serif text-xl mb-6">Order Summary</h3>
          <div className="flex flex-col gap-4 mb-6">
            {cartItems.map(item => (
              <div key={item.productId} className="flex justify-between items-center text-sm">
                <span className="opacity-70">{item.quantity}x {item.product.name}</span>
                <span className="font-bold">${(item.product.numericPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-ink/10 pt-4 flex justify-between items-center text-lg">
            <span className="font-serif">Total</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
