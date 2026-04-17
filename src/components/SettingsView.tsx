import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { translations, Language } from '../i18n';
import { X, Moon, Sun, Globe } from 'lucide-react';
import { auth, logoutUser, loginWithGoogle } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function SettingsView({ 
  isOpen, 
  onClose,
  lang,
  setLang,
  isDark,
  setIsDark
}: { 
  isOpen: boolean; 
  onClose: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
}) {
  const { userProfile, updateUserProfile } = useAppStore();
  const t = translations[lang];
  const [user] = auth ? useAuthState(auth) : [null];

  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || '',
    phone: userProfile.phone || '',
    address: userProfile.address || ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-overlay transition-colors"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-brand-bg md:p-10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute right-6 top-6 opacity-50 hover:opacity-100 transition-opacity">
          <X size={20} />
        </button>

        <h2 className="font-serif text-3xl mb-8">User Settings</h2>

        <div className="flex flex-col gap-8">
          {/* Theme & Language Toggles */}
          <section className="flex flex-col gap-4">
            <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-ink/50 border-b border-brand-ink/10 pb-2">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Appearance</span>
              <button 
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2 border border-brand-ink/20 px-4 py-2 hover:border-brand-accent transition-colors"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                <span className="text-xs uppercase tracking-widest">{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Language</span>
              <div className="flex border border-brand-ink/20">
                {(['EN', 'FR', 'AR'] as Language[]).map((l) => (
                  <button 
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-2 text-xs uppercase tracking-widest transition-colors ${lang === l ? 'bg-brand-ink text-brand-bg' : 'hover:bg-brand-ink/5'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* User Profile Form */}
          <section className="flex flex-col gap-4">
            <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-ink/50 border-b border-brand-ink/10 pb-2">Profile Details</h3>
            
            {!user ? (
              <div className="text-sm opacity-70 bg-brand-ink/5 p-4 flex flex-col items-start gap-4">
                <p>Register an account to securely save your details across sessions.</p>
                <button onClick={loginWithGoogle} className="text-brand-accent hover:underline">Log in securely with Google</button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-60">Full Name</label>
                  <input 
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="bg-transparent border border-brand-ink/20 px-3 py-2 focus:border-brand-accent outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-60">Phone</label>
                  <input 
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-transparent border border-brand-ink/20 px-3 py-2 focus:border-brand-accent outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-60">Saved Address</label>
                  <textarea 
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="bg-transparent border border-brand-ink/20 px-3 py-2 focus:border-brand-accent outline-none resize-none h-20"
                  />
                </div>
                <button type="submit" className="bg-brand-ink text-brand-bg py-3 text-[10px] uppercase tracking-widest hover:bg-brand-accent transition-colors mt-2">
                  Save Changes
                </button>
              </form>
            )}
          </section>

          {/* Authentication Status */}
          {user && (
            <section className="flex flex-col gap-4 mt-4">
               <button onClick={() => { logoutUser(); onClose(); }} className="text-red-500 hover:underline text-xs tracking-widest uppercase text-left">
                 Log Out
               </button>
            </section>
          )}

        </div>
      </motion.div>
    </div>
  );
}
