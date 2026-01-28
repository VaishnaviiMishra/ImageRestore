
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-6 flex flex-col items-center text-center">
      <div className="mb-2">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
          Powered by Gemini 2.5
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
        Vintage<span className="gradient-text italic">Heal</span>
      </h1>
      <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed">
        Breathe new life into your family history. Our AI restoration engine removes artifacts, heals cracks, and sharpens memories in seconds.
      </p>
    </header>
  );
};

export default Header;
