import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { getHairRecommendationStream } from '../services/aiService';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageName: string;
}

export default function AIModal({ isOpen, onClose, languageName }: AIModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hairType, setHairType] = useState('');
  const [concern, setConcern] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const startAnalysis = async () => {
    setStep(3);
    setResponse('');
    setIsGenerating(true);

    try {
      const stream = getHairRecommendationStream(hairType, concern, languageName);
      for await (const chunk of stream) {
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-brand-ink/90 flex items-center justify-center p-4 md:p-6"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-brand-bg w-full max-w-2xl p-8 md:p-12 font-sans relative overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-brand-accent mb-8">
              <Sparkles size={20} />
              <h3 className="font-serif text-xl tracking-widest uppercase">Tolean AI Consultant</h3>
            </div>

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="text-2xl font-serif mb-6">What is your natural hair type?</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['Straight', 'Wavy', 'Curly', 'Coily'].map(type => (
                    <button 
                      key={type}
                      onClick={() => { setHairType(type); setStep(2); }}
                      className="border border-brand-ink/10 p-4 text-left hover:border-brand-accent hover:bg-brand-accent/5 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="text-2xl font-serif mb-6">What is your primary focus?</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['Damage Repair', 'Frizz Control', 'Scalp Health', 'Dryness'].map(conc => (
                    <button 
                      key={conc}
                      onClick={() => { setConcern(conc); startAnalysis(); }}
                      className="border border-brand-ink/10 p-4 text-left hover:border-brand-accent hover:bg-brand-accent/5 transition-colors"
                    >
                      {conc}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="min-h-[150px] border-l-2 border-brand-accent pl-6 py-2">
                  {isGenerating && !response && (
                    <div className="flex flex-col gap-2 opacity-60">
                      <p className="animate-pulse">Analyzing follicle profile...</p>
                      <p className="animate-pulse delay-150">Synthesizing botanical recommendations...</p>
                    </div>
                  )}
                  {response && (
                    <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap">
                      {response.split('**').map((part, i) => 
                        i % 2 === 1 ? <span key={i} className="text-brand-accent font-bold">{part}</span> : part
                      )}
                    </div>
                  )}
                </div>
                {!isGenerating && response && (
                  <button 
                    onClick={() => { setStep(1); setResponse(''); setHairType(''); setConcern(''); }}
                    className="mt-10 text-[10px] uppercase tracking-widest border-b border-brand-ink pb-1 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    Start New Diagnosis
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
