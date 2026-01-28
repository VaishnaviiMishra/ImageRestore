import React from 'react';
import { Defect, RestorationOptions } from '../types';

interface Props {
  defects: Defect[];
  selectedOptions: RestorationOptions;
  onDefectToggle: (defectType: string) => void;
  onOptionChange: (option: keyof RestorationOptions, value: any) => void;
  onStartRestoration: () => void;
  onBack: () => void;
}

const RestorationOptionsPanel: React.FC<Props> = ({
  defects,
  selectedOptions,
  onDefectToggle,
  onOptionChange,
  onStartRestoration,
  onBack
}) => {
  return (
    <div className="glass rounded-3xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-rose-400">⚙️</span> Restoration Options
      </h3>

      <div className="mb-8">
        <h4 className="font-bold mb-4 text-slate-300">Select Defects to Fix</h4>
        <div className="space-y-3">
          {defects.map((defect, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="font-medium">{defect.type.replace('_', ' ')}</div>
                <div className="text-sm text-slate-400">{defect.description}</div>
              </div>
              <button
                onClick={() => onDefectToggle(defect.type)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  selectedOptions.defectsToFix.includes(defect.type)
                    ? 'bg-rose-500 justify-end'
                    : 'bg-slate-700 justify-start'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                  selectedOptions.defectsToFix.includes(defect.type)
                    ? 'translate-x-5'
                    : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-bold mb-4 text-slate-300">Additional Options</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div>
              <div className="font-medium">Enhance Colors</div>
              <div className="text-sm text-slate-400">Improve color vibrancy and balance</div>
            </div>
            <button
              onClick={() => onOptionChange('enhanceColors', !selectedOptions.enhanceColors)}
              className={`w-10 h-6 rounded-full transition-colors ${
                selectedOptions.enhanceColors
                  ? 'bg-rose-500 justify-end'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                selectedOptions.enhanceColors
                  ? 'translate-x-5'
                  : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div>
              <div className="font-medium">Preserve Original Details</div>
              <div className="text-sm text-slate-400">Maintain original textures and patterns</div>
            </div>
            <button
              onClick={() => onOptionChange('preserveOriginal', !selectedOptions.preserveOriginal)}
              className={`w-10 h-6 rounded-full transition-colors ${
                selectedOptions.preserveOriginal
                  ? 'bg-rose-500 justify-end'
                  : 'bg-slate-700 justify-start'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                selectedOptions.preserveOriginal
                  ? 'translate-x-5'
                  : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
        <div className="text-sm font-medium text-slate-300 mb-2">Selected Options Summary</div>
        <div className="text-sm text-slate-400">
          {selectedOptions.defectsToFix.length === 0 ? (
            <div className="text-red-400">No defects selected for restoration</div>
          ) : (
            <div>
              <div className="mb-1">Fixing: {selectedOptions.defectsToFix.map(d => d.replace('_', ' ')).join(', ')}</div>
              {selectedOptions.enhanceColors && <div>• Color enhancement enabled</div>}
              {selectedOptions.preserveOriginal && <div>• Original details preservation enabled</div>}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold transition-all border border-slate-700"
        >
          Back to Image
        </button>
        <button
          onClick={onStartRestoration}
          disabled={selectedOptions.defectsToFix.length === 0}
          className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
            selectedOptions.defectsToFix.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 active:scale-95'
          }`}
        >
          <span>Start Restoration</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RestorationOptionsPanel;