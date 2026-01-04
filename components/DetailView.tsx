/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { TrendItem, SocialPlatform } from '../types';
import { generateSocialPost } from '../services/gemini';
import * as Icons from 'lucide-react';

interface DetailViewProps {
  trend: TrendItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (trend: TrendItem) => void;
  isReadLater: boolean;
  onToggleReadLater: (trend: TrendItem) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ 
  trend, 
  onClose, 
  isSaved, 
  onToggleSave,
  isReadLater,
  onToggleReadLater
}) => {
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!trend) return null;

  const handleGenerate = async (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setIsGenerating(true);
    setGeneratedContent('');
    setCopied(false);
    
    const content = await generateSocialPost(trend, platform);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Panel - Glass */}
      <div className="relative w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl h-full border-l border-white/10 shadow-2xl transform transition-transform overflow-y-auto flex flex-col">
        {/* Glossy gradient top */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/70 backdrop-blur-xl border-b border-white/10 p-6 flex items-start justify-between shrink-0">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 rounded-full shadow-sm">
                {trend.category}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight pr-8 drop-shadow-md">{trend.title}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleReadLater(trend)}
              className={`p-2.5 rounded-full transition-all border ${isReadLater ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
              title={isReadLater ? "Remove from Read Later" : "Read Later"}
            >
              <Icons.Clock size={20} className={isReadLater ? "fill-current" : ""} />
            </button>

            <button
              onClick={() => onToggleSave(trend)}
              className={`p-2.5 rounded-full transition-all border ${isSaved ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
              title={isSaved ? "Unsave trend" : "Save trend"}
            >
              <Icons.Bookmark size={20} className={isSaved ? "fill-current" : ""} />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-white text-slate-400 transition-all"
            >
              <Icons.X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto relative">
          
          {/* Generator Call-to-Action */}
          {!showGenerator && (
            <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 border border-white/10 rounded-2xl p-6 flex items-center justify-between backdrop-blur-md shadow-lg group hover:border-indigo-500/30 transition-all">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
                  <Icons.Wand2 size={20} className="text-indigo-400" />
                  Turn this trend into content
                </h3>
                <p className="text-sm text-slate-300">Generate a post for LinkedIn, Twitter, or TikTok in seconds.</p>
              </div>
              <button 
                onClick={() => setShowGenerator(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-900/40 border border-indigo-400/20 active:scale-95"
              >
                Create Post
              </button>
            </div>
          )}

          {/* Generator Interface */}
          {showGenerator && (
            <div className="bg-black/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 shadow-2xl">
              <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Icons.PenTool size={18} className="text-indigo-400" />
                  AI Content Generator
                </h3>
                <button onClick={() => setShowGenerator(false)} className="text-slate-400 hover:text-white">
                  <Icons.X size={18} />
                </button>
              </div>
              
              <div className="p-6">
                {!generatedContent && !isGenerating ? (
                  <>
                    <p className="text-sm text-slate-300 mb-4 font-medium">Select a platform to generate a draft:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 'LinkedIn', icon: Icons.Briefcase, label: 'LinkedIn' },
                        { id: 'Twitter', icon: Icons.Twitter, label: 'Twitter' },
                        { id: 'Newsletter', icon: Icons.Mail, label: 'Email' },
                        { id: 'TikTok', icon: Icons.Video, label: 'TikTok Script' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleGenerate(p.id as SocialPlatform)}
                          className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-white/5 transition-all group"
                        >
                          <p.icon size={24} className="text-slate-400 group-hover:text-indigo-300 transition-colors" />
                          <span className="text-xs font-bold text-slate-300 group-hover:text-white">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : isGenerating ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <Icons.Loader2 size={40} className="text-indigo-400 animate-spin mb-4 relative z-10" />
                    </div>
                    <p className="text-white font-semibold text-lg">Drafting your {selectedPlatform} post...</p>
                    <p className="text-sm text-slate-400 mt-1">Analyzing tone and structure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{selectedPlatform} Draft</span>
                      <button 
                         onClick={() => { setGeneratedContent(''); setSelectedPlatform(null); }}
                         className="text-xs text-slate-400 hover:text-white hover:underline"
                      >
                        Start Over
                      </button>
                    </div>
                    <textarea 
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-mono leading-relaxed shadow-inner"
                    />
                    <button 
                      onClick={handleCopy}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                    >
                      {copied ? (
                        <>
                          <Icons.Check size={20} />
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Icons.Copy size={20} />
                          Copy Text
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Actionable Advice - Glass Highlight */}
          <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6 rounded-2xl border border-indigo-400/20 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-lg font-bold text-indigo-200 mb-3 flex items-center gap-2 relative z-10">
              <Icons.Lightbulb size={20} className="fill-current text-amber-300" />
              Quick Tip
            </h3>
            <p className="text-indigo-50 leading-relaxed text-lg font-light relative z-10">
              {trend.advice}
            </p>
          </section>

          {/* Main Content */}
          <section>
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Icons.Info size={20} className="text-indigo-400" />
              What is this about?
            </h3>
            <p className="text-slate-200 leading-relaxed text-base bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
              {trend.summary}
            </p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                <Icons.Target size={16} /> Importance
              </div>
              <div className="text-4xl font-bold text-white tracking-tight">{trend.impactScore}<span className="text-lg text-slate-500 font-normal ml-1">%</span></div>
              <div className="text-xs text-slate-500 mt-2">Relevance to the industry</div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                <Icons.Smile size={16} /> Vibe
              </div>
              <div className={`text-2xl font-bold ${trend.sentiment === 'Positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {trend.sentiment === 'Positive' ? 'Generally Good' : 'Discussion Topic'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Based on online chatter</div>
            </div>
          </section>

          {/* Sources */}
          <section className="pb-8">
             <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Icons.BookOpen size={20} className="text-indigo-400" />
              Read More
            </h3>
            {trend.sources.length > 0 ? (
              <ul className="space-y-3">
                {trend.sources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="text-sm text-indigo-300 truncate group-hover:underline font-medium">{source.title}</span>
                      <Icons.ExternalLink size={14} className="text-slate-500 flex-shrink-0 ml-2 group-hover:text-white transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500 text-sm italic p-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-center">No extra links available.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DetailView;