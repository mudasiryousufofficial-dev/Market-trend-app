
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES, PERSONAS } from '../constants';
import { TrendCategory, UserPersona } from '../types';

interface SidebarProps {
  selectedCategory: TrendCategory;
  onSelectCategory: (category: TrendCategory) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  userPersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  onOpenMotivation?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  isOpen, 
  toggleSidebar,
  userPersona,
  onSelectPersona,
  onOpenMotivation
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Glass Effect */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 
          bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 shadow-2xl
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block flex flex-col
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
              <Icons.Zap size={20} className="fill-current text-indigo-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">MarketPulse</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
            <Icons.X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Motivation Button */}
          {onOpenMotivation && (
             <button
                onClick={() => {
                  onOpenMotivation();
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-200 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all mb-4 group shadow-sm"
             >
                <Icons.Sparkles size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Daily Inspiration</span>
             </button>
          )}

          <div className="text-xs font-bold text-slate-500/80 uppercase tracking-widest mb-2 px-2 mt-2">
            Explore
          </div>
          {CATEGORIES.map((cat) => {
            // Dynamically get icon component
            const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
            
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id as TrendCategory);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectedCategory === cat.id 
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent'}
                `}
              >
                <IconComponent size={18} className={selectedCategory === cat.id ? "drop-shadow" : ""} />
                <span>{cat.label}</span>
                {selectedCategory === cat.id && (
                  <Icons.ChevronRight size={14} className="ml-auto opacity-70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Persona Selector and Status Footer */}
        <div className="w-full p-4 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent space-y-4 shrink-0">
          
          {/* Persona Switcher */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-500/80 uppercase tracking-widest px-1">
               Viewing Context
             </label>
             <div className="relative group">
                <select 
                  value={userPersona}
                  onChange={(e) => onSelectPersona(e.target.value as UserPersona)}
                  className="w-full appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  {PERSONAS.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-300">
                      {p.label}
                    </option>
                  ))}
                </select>
                <Icons.ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
             </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4 text-xs text-slate-400 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-300">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-wide text-[10px] uppercase">CONNECTED</span>
            </div>
            Smart insights powered by Google Gemini
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
