/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { TrendItem } from '../types';
import * as Icons from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface TrendCardProps {
  trend: TrendItem;
  onClick: (trend: TrendItem) => void;
  isSaved: boolean;
  onToggleSave: (trend: TrendItem, e: React.MouseEvent) => void;
  isReadLater: boolean;
  onToggleReadLater: (trend: TrendItem, e: React.MouseEvent) => void;
}

const TrendCard: React.FC<TrendCardProps> = ({ 
  trend, 
  onClick, 
  isSaved, 
  onToggleSave,
  isReadLater,
  onToggleReadLater
}) => {
  // Simulate data for the tiny chart
  const data = Array.from({ length: 10 }, (_, i) => ({
    uv: 20 + Math.random() * 30 + (i * (trend.impactScore / 20)),
  }));

  const getSentimentColor = (s: string) => {
    switch (s) {
      case 'Positive': return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
      case 'Mixed': return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
      default: return 'text-slate-300 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getSentimentLabel = (s: string) => {
    if (s === 'Positive') return 'Good News';
    if (s === 'Mixed') return 'Debated';
    return 'Neutral';
  };

  return (
    <div 
      onClick={() => onClick(trend)}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      {/* Glossy sheen effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-sm">
          {trend.category}
        </span>
        
        <div className="flex items-center gap-2">
           <div className={`mr-1 text-[10px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${getSentimentColor(trend.sentiment)}`}>
             {trend.sentiment === 'Positive' ? <Icons.ThumbsUp size={10} /> : <Icons.MessageCircle size={10} />}
             <span className="hidden sm:inline">{getSentimentLabel(trend.sentiment)}</span>
           </div>
           
           <button 
             onClick={(e) => onToggleReadLater(trend, e)}
             className={`p-1.5 rounded-full transition-all border ${isReadLater ? 'text-indigo-300 bg-indigo-500/30 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/10'}`}
             title={isReadLater ? "Remove from Read Later" : "Read Later"}
           >
             <Icons.Clock size={16} className={isReadLater ? "fill-current" : ""} />
           </button>

           <button 
             onClick={(e) => onToggleSave(trend, e)}
             className={`p-1.5 rounded-full transition-all border ${isSaved ? 'text-indigo-300 bg-indigo-500/30 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/10'}`}
             title={isSaved ? "Unsave trend" : "Save trend"}
           >
             <Icons.Bookmark size={16} className={isSaved ? "fill-current" : ""} />
           </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-indigo-200 transition-colors drop-shadow-sm relative z-10">
        {trend.title}
      </h3>

      <p className="text-slate-300 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed font-light relative z-10">
        {trend.summary}
      </p>

      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Relevance</span>
          <div className="flex items-center gap-2">
             <div className="flex gap-1">
               {[1, 2, 3, 4, 5].map(i => (
                 <div 
                  key={i} 
                  className={`h-1.5 w-4 rounded-full transition-all ${i * 20 <= trend.impactScore ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-white/10'}`}
                 />
               ))}
             </div>
          </div>
        </div>
        
        {/* Visual Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300/80 uppercase font-bold tracking-wider">
           <span>Explore</span>
           <Icons.ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default TrendCard;