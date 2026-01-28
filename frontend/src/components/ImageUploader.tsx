
import React, { useRef } from 'react';

interface Props {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={triggerInput}
      className="group relative w-full max-w-xl mx-auto p-12 border-2 border-dashed border-slate-700 rounded-3xl cursor-pointer hover:border-rose-500/50 transition-all duration-300 glass flex flex-col items-center justify-center text-center"
    >
      <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
      
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Upload Photo</h3>
      <p className="text-slate-400 text-sm mb-4">Drag and drop or click to browse files</p>
      <p className="text-xs text-slate-500 italic">Supports JPG, PNG (Max 5MB)</p>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
