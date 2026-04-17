/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  ChevronRight, 
  Sparkles, 
  Globe,
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { translations, Language } from './i18n';
import ShopView from './ShopView';
import AnimatedLogo from './AnimatedLogo';
import AIModal from './components/AIModal';
import { useAppStore } from './store';
import { loginWithGoogle, logoutUser, auth } from './services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'shop'>('home');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const { products, productViews } = useAppStore();
  const [user] = auth ? useAuthState(auth) : [null];

  const t = translations[lang];

  // Dynamic "For You" algorithm based on product views
  const recommendedProducts = [...products]
    .sort((a, b) => (productViews[b.id] || 0) - (productViews[a.id] || 0))
    .slice(0, 2);

  useEffect(() => {
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-accent selection:text-white overflow-x-hidden">
      {/* Top Bar */}
      <div className="h-[40px] px-4 md:px-10 flex justify-between items-center border-b border-brand-ink/5 text-[9px] md:text-[10px] tracking-[0.1em] font-semibold uppercase">
        <div className="relative z-50">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity opacity-60 hover:text-brand-accent"
          >
            <Globe size={12} /> {t.languageName}
          </button>
          <AnimatePresence>
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full mt-2 w-32 bg-brand-card border border-brand-ink/5 shadow-2xl py-2 z-50 start-0"
                >
                  {(Object.keys(translations) as Language[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setLang(key);
                        setIsLangOpen(false);
                      }}
                      className={`block w-full text-start px-4 py-2 hover:bg-brand-bg transition-colors ${lang === key ? 'text-brand-accent font-bold' : ''}`}
                    >
                      {translations[key].languageName}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <div className="hidden md:block overflow-hidden">
          <motion.p
            key={lang}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-brand-accent"
          >
            {t.promo}
          </motion.p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="hover:text-brand-accent transition-colors opacity-60 hover:opacity-100 flex items-center gap-1"
          >
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
          </button>
          <span className="opacity-20 hidden md:inline">|</span>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-brand-accent truncate max-w-[100px] md:max-w-none">{user.displayName}</span>
              <button onClick={logoutUser} className="hover:text-brand-accent transition-colors"><LogOut size={12}/></button>
            </div>
          ) : (
            <>
              <button onClick={loginWithGoogle} className="hover:text-brand-accent transition-colors">{t.login}</button>
              <span className="opacity-20">/</span>
              <button onClick={loginWithGoogle} className="hover:text-brand-accent transition-colors">{t.register}</button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="h-[70px] md:h-[80px] px-4 md:px-10 flex justify-between items-center relative z-40">
        <div 
          className="cursor-pointer h-full py-2"
          onClick={() => setCurrentTab('home')}
        >
          <AnimatedLogo className="h-full w-auto" />
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-xs font-medium tracking-[0.05em] uppercase">
          <button onClick={() => setCurrentTab('shop')} className={`pb-1 ${currentTab === 'shop' ? 'border-b border-brand-ink' : 'opacity-60 hover:opacity-100 transition-opacity'}`}>{t.shopAll}</button>
          <button className="opacity-60 hover:opacity-100 transition-opacity">{t.theAtelier}</button>
          <button className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5">
            {t.forYou} <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
          </button>
          <button className="opacity-60 hover:opacity-100 transition-opacity">{t.about}</button>
        </div>

        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors whitespace-nowrap">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute top-1 end-1 w-2 h-2 bg-brand-accent rounded-full border border-brand-bg" />
          </button>
          <button className="lg:hidden p-2">
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Main Content / Routing */}
      {currentTab === 'home' ? (
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
          {/* Left: Hero/Collection */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative min-h-[400px] md:min-h-[500px] bg-[#EEE9E1] rounded overflow-hidden flex flex-col justify-end p-6 md:p-12 group"
        >
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#e0dcd4] to-[#c9c5bc]" />
          <img 
            src="https://picsum.photos/seed/hair-oil/1200/800" 
            alt="Product"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105"
          />
          
          <div className="relative z-10 max-w-xl mt-32 md:mt-0">
            <span className="font-serif italic text-base md:text-xl text-brand-accent mb-2 md:mb-4 block">
              {t.heroTag}
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] md:leading-[0.95] mb-6 md:mb-8 uppercase tracking-tighter">
              {t.heroTitleLine1}<br />{t.heroTitleLine2}
            </h1>
            <button 
              onClick={() => setCurrentTab('shop')}
              className="bg-brand-ink text-white px-6 py-4 md:px-10 md:py-5 text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-brand-accent transition-colors flex items-center gap-3 md:gap-4 w-fit"
            >
              {t.explore}
              <ChevronRight size={14} className="rtl:rotate-180 shrink-0" />
            </button>
          </div>
        </motion.section>

        {/* Right: AI & Personalized */}
        <div className="flex flex-col gap-8 lg:gap-10">
          {/* AI Consultant */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-brand-card border border-brand-ink/5 p-6 md:p-10 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-serif text-2xl mb-1">{t.aiTitle}</h2>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-brand-accent">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                  </span>
                  {t.aiStatus}
                </div>
              </div>
              <Sparkles className="text-brand-accent" size={24} strokeWidth={1} />
            </div>

            <div className="flex-grow space-y-6">
              <div className="bg-brand-bg/50 border-s-2 border-brand-accent p-6 text-sm leading-relaxed text-brand-ink/70">
                {t.aiMessage}
              </div>
              
              <div className="text-[13px] text-brand-ink/50 italic font-light">
                {t.aiAnalyzingLine1} <br />
                {t.aiAnalyzingLine2}
              </div>
            </div>

            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="mt-10 w-full border border-brand-ink py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-ink hover:text-brand-bg transition-all flex items-center justify-center gap-3"
            >
              {t.startDiagnosis}
            </button>
          </motion.section>

          {/* For You Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-brand-card border border-brand-ink/5 p-6 md:p-10"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/40 mb-6 block">
              {t.personalized}
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendedProducts.map((product, i) => (
                <div key={product.id} className="flex gap-4 items-center group cursor-pointer" onClick={() => setCurrentTab('shop')}>
                  <div className={`w-20 h-28 bg-zinc-200 rounded-sm overflow-hidden relative shrink-0`}>
                    <img 
                      src={`https://picsum.photos/seed/${product.img}/200/300`} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-serif text-lg leading-tight mb-1 group-hover:text-brand-accent transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[12px] opacity-50">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
      ) : (
        <ShopView lang={lang} />
      )}

      {/* Footer / Admin Portal Trigger */}
      <footer className="px-4 md:px-10 py-6 border-t border-brand-ink/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-brand-card/50">
        <div className="text-[9px] opacity-40 uppercase tracking-[0.1em] flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <span>{t.system}</span>
          <span className="hidden md:inline">•</span>
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className="hover:opacity-100 transition-opacity flex items-center gap-1 opacity-80"
          >
            <Settings size={10} />
            {t.adminAccess}
          </button>
        </div>
        
        <div className="flex gap-4 md:gap-6 text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">
          <a href="#" className="hover:text-brand-accent transition-colors">{t.sustainability}</a>
          <a href="#" className="hover:text-brand-accent transition-colors">{t.contact}</a>
        </div>
      </footer>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        languageName={t.languageName}
      />

      {/* Admin Panel Overlay (Demo) */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-ink/90 flex items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 font-sans rounded-none"
            >
              <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent mb-2">{t.adminInternal}</h3>
                  <h2 className="font-serif text-2xl md:text-3xl">{t.adminAnalytics}</h2>
                </div>
                <button 
                  onClick={() => setIsAdmin(false)}
                  className="text-xs uppercase tracking-widest underline decoration-brand-accent underline-offset-8 mt-2 md:mt-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  {t.adminReturn}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-10">
                {[
                  { label: t.statRevenue, value: t.revenueValue, change: '+12.4%' },
                  { label: t.statConsultations, value: '4,892', change: '+45%' },
                  { label: t.statSubs, value: '890', change: '+2.1%' }
                ].map((stat, i) => (
                  <div key={i} className="bg-brand-card p-6 border border-brand-ink/5">
                    <p className="text-[9px] uppercase tracking-widest text-brand-ink/40 mb-2">{stat.label}</p>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-light">{stat.value}</p>
                      <span className="text-emerald-600 text-[10px] font-bold">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold border-b border-brand-ink/10 pb-2">{t.adminProducts}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="opacity-40">
                        <th className="py-2 font-medium text-start">{t.sku}</th>
                        <th className="py-2 font-medium text-start">{t.name}</th>
                        <th className="py-2 font-medium text-start">{t.stock}</th>
                        <th className="py-2 font-medium text-start">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-ink/5">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="py-3 text-start">TLN-PRD-0{product.id}</td>
                          <td className="py-3 font-serif italic text-sm text-start">{product.name}</td>
                          <td className="py-3 text-start">{product.stock} {t.product1Stock.split(' ')[1]}</td>
                          <td className={`py-3 uppercase font-bold tracking-tighter text-start ${product.stock > 30 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            {product.stock > 30 ? t.active : product.stock > 0 ? t.lowStock : 'OOS'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
