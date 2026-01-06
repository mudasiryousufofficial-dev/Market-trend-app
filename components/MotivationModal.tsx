
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import * as Icons from 'lucide-react';

interface MotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  story: string;
  loading: boolean;
}

const MotivationModal: React.FC<MotivationModalProps> = ({ isOpen, onClose, title, story, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="p-8 relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <Icons.X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/20 shadow-inner">
              <Icons.Sparkles size={32} className="text-indigo-300" />
            </div>

            {loading ? (
              <div className="py-8 space-y-4 w-full">
                <div className="h-4 bg-white/10 rounded w-3/4 mx-auto animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded w-5/6 mx-auto animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded w-4/6 mx-auto animate-pulse"></div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                  {title}
                </h3>
                <div className="w-12 h-0.5 bg-indigo-500/50 my-4 rounded-full"></div>
                <p className="text-slate-300 text-lg leading-relaxed italic font-light">
                  "{story}"
                </p>
                
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                  Stay Inspired
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationModal;
