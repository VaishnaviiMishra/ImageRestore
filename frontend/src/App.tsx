import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ComparisonSlider from './components/ComparisonSlider';
import AnalysisPanel from './components/AnalysisPanel';
import ValidationPanel from './components/ValidationPanel';
import { AppStatus, ImageState, AnalysisResult, ValidationResult } from './types';
import { analyzeImage, restoreImage, validateRestoration } from './services/restorationService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageState>({
    original: null,
    restored: null,
    mimeType: null,
    fileName: null
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages({
        original: e.target?.result as string,
        restored: null,
        mimeType: file.type,
        fileName: file.name
      });
      setStatus(AppStatus.IDLE);
      setError(null);
      setAnalysis(null);
      setValidation(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const startAnalysis = async () => {
    if (!currentFile) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);
    
    try {
      const result = await analyzeImage(currentFile, (msg) => setProgressMsg(msg));
      setAnalysis(result.analysis);
      setStatus(AppStatus.ANALYSIS_COMPLETE);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || "Analysis failed");
      setStatus(AppStatus.ERROR);
    }
  };

  const startRestoration = async () => {
    if (!currentFile) return;

    setStatus(AppStatus.RESTORING);
    setError(null);
    
    try {
      // Use defects from analysis if available, otherwise use defaults
      const defectsToFix = analysis?.defects?.map(d => d.type) || 
                          ['SCRATCHES', 'DUST_SPOTS', 'FADED_COLORS', 'NOISE_GRAIN'];
      
      const restorationOptions = {
        defectsToFix,
        enhanceColors: true,
        preserveOriginal: true,
        analysisData: analysis // Pass analysis data to help prevent adding elements
      };

      console.log('Starting restoration with options:', restorationOptions);
      
      const restored = await restoreImage(currentFile, restorationOptions, (msg) => setProgressMsg(msg));
      setImages(prev => ({ ...prev, restored: restored.restoredImage }));
      
      // Automatically start validation after restoration
      setStatus(AppStatus.VALIDATING);
      await startValidation(restored.originalPath, restored.restoredPath);
    } catch (err: any) {
      console.error('Restoration error:', err);
      setError(err.message || "An unexpected error occurred");
      setStatus(AppStatus.ERROR);
    }
  };

  const startValidation = async (originalPath: string, restoredPath: string) => {
    try {
      const validationResult = await validateRestoration(
        originalPath, 
        restoredPath, 
        analysis, // Pass analysis data for better validation
        (msg) => setProgressMsg(msg)
      );
      setValidation(validationResult.validation);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || "Validation failed");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setImages({ original: null, restored: null, mimeType: null, fileName: null });
    setCurrentFile(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    setAnalysis(null);
    setValidation(null);
  };

  const handleDownload = () => {
    if (!images.restored) return;
    const link = document.createElement('a');
    link.href = images.restored;
    link.download = `restored-${images.fileName || 'photo.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <Header />

      <main className="max-w-6xl mx-auto px-6">
        {!images.original && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
            <ImageUploader onImageSelect={handleImageSelect} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
              <div className="p-6 glass rounded-2xl border-slate-800 text-center">
                <div className="text-rose-400 font-bold mb-2">Upload</div>
                <div className="text-sm font-medium">Select Your Photo</div>
                <div className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</div>
              </div>
              <div className="p-6 glass rounded-2xl border-slate-800 text-center">
                <div className="text-rose-400 font-bold mb-2">Process</div>
                <div className="text-sm font-medium">AI Restoration</div>
                <div className="text-xs text-slate-500 mt-1">Gemini 2.5 Flash Pro</div>
              </div>
              <div className="p-6 glass rounded-2xl border-slate-800 text-center">
                <div className="text-rose-400 font-bold mb-2">Download</div>
                <div className="text-sm font-medium">Get Restored Image</div>
                <div className="text-xs text-slate-500 mt-1">High quality result</div>
              </div>
            </div>
          </div>
        )}

        {images.original && status !== AppStatus.COMPLETED && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center max-w-4xl mx-auto">
            <div className="relative w-full glass rounded-3xl overflow-hidden p-2 group">
              <img src={images.original} alt="Original" className="w-full rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
              {(status === AppStatus.ANALYZING || status === AppStatus.RESTORING || status === AppStatus.VALIDATING) && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 animate-pulse">
                    {status === AppStatus.ANALYZING && "Analyzing Image..."}
                    {status === AppStatus.RESTORING && "Restoring Image..."}
                    {status === AppStatus.VALIDATING && "Validating Restoration..."}
                  </h3>
                  <p className="text-slate-400 text-sm tracking-wide uppercase font-medium">{progressMsg}</p>
                </div>
              )}
            </div>

            {/* Show Analysis Results */}
            {status === AppStatus.ANALYSIS_COMPLETE && analysis && (
              <div className="mt-8 w-full">
                <AnalysisPanel analysis={analysis} />
              </div>
            )}

            <div className="mt-8 flex gap-4 w-full justify-center">
              {status === AppStatus.IDLE && (
                <>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={startAnalysis}
                    className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-3"
                  >
                    <span>Analyze & Restore Image</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95L12.5 5h.5a.5.5 0 010 1h-1.45l-1.016 6.772a.5.5 0 01-.493.428H6.46a.5.5 0 01-.493-.428L4.95 6H3.5a.5.5 0 010-1h.5l.303-3.003a1 1 0 01.897-.95h6.1zM8 4V2h4v2H8zm-2.15 2l.9 6h6.5l.9-6h-8.3z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
              {status === AppStatus.ANALYSIS_COMPLETE && (
                <>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={startRestoration}
                    className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-3"
                  >
                    <span>Start Restoration</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm max-w-md text-center">
                <div className="font-bold mb-2">Error Details:</div>
                {error}
                <button 
                  onClick={() => {
                    setError(null);
                    setStatus(AppStatus.IDLE);
                  }} 
                  className="block mx-auto mt-2 underline font-semibold hover:text-red-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {status === AppStatus.COMPLETED && images.original && images.restored && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <ComparisonSlider before={images.original} after={images.restored} />
            
            {/* Show Validation Results */}
            {validation && (
              <div className="mt-8">
                <ValidationPanel validation={validation} />
              </div>
            )}
            
            <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-center">
              <button 
                onClick={handleReset}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                Restore Another Image
              </button>
              <button 
                onClick={handleDownload}
                className="w-full md:w-auto px-12 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>Download Restored Image</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-6 px-8 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-t border-slate-800 z-50">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini 2.5 Pro Ready</span>
          </div>
          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">3-Stage AI Restoration</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">
          VintageHeal Pro &copy; 2024 • AI-Powered Photo Restoration
        </div>
      </footer>
    </div>
  );
};

export default App;