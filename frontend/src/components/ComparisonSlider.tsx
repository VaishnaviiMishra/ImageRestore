
import React from 'react';

interface Props {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<Props> = ({ before, after }) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Before Card */}
      <div className="flex-1 group">
        <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden glass border border-slate-700 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
          <img 
            src={before} 
            alt="Original" 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Archive</span>
            <span className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg">
              Original Photo
            </span>
          </div>
        </div>
      </div>

      {/* Separator / Icon for desktop */}
      <div className="hidden md:flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <svg xmlns="http://www.w3.org/2000/center" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* After Card */}
      <div className="flex-1 group">
        <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden glass border border-rose-500/30 shadow-2xl shadow-rose-500/10 transition-transform duration-500 group-hover:scale-[1.02]">
          <img 
            src={after} 
            alt="Restored" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 mb-1">Enhanced</span>
            <span className="bg-rose-500/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white border border-rose-400/30 shadow-lg">
              Restored Result
            </span>
          </div>
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-1 bg-rose-500/10 blur-2xl -z-10 group-hover:bg-rose-500/20 transition-all"></div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
