import React from 'react';
import { ValidationResult } from '../types';

interface Props {
  validation: ValidationResult;
}

const ValidationPanel: React.FC<Props> = ({ validation }) => {
  return (
    <div className="mt-8 glass rounded-3xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className={`${validation.overallResult === 'PASSED' ? 'text-green-400' : 'text-red-400'}`}>
          {validation.overallResult === 'PASSED' ? '✅' : '❌'}
        </span>
        AI Validation Results
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
          validation.overallResult === 'PASSED'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {validation.overallResult}
        </span>
      </h3>

      <div className="bg-slate-900/50 rounded-xl p-4">
        <h4 className="font-bold mb-3 text-slate-300">Perceptual Content Integrity (Human Check)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Added Elements / Details</span>
            <span className={`font-medium ${validation.contentValidation.hasAddedElements === 'NO' ? 'text-green-400' : 'text-red-400'}`}>
              {validation.contentValidation.hasAddedElements === 'NO' ? 'None ✓' : 'Detected ✗'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Removed Elements / Details</span>
            <span className={`font-medium ${validation.contentValidation.hasRemovedElements === 'NO' ? 'text-green-400' : 'text-red-400'}`}>
              {validation.contentValidation.hasRemovedElements === 'NO' ? 'None ✓' : 'Detected ✗'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Altered Faces</span>
            <span className={`font-medium ${validation.contentValidation.hasAlteredFaces === 'NO' ? 'text-green-400' : 'text-red-400'}`}>
              {validation.contentValidation.hasAlteredFaces === 'NO' ? 'Preserved ✓' : 'Changed ✗'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Changed Composition</span>
            <span className={`font-medium ${validation.contentValidation.hasChangedComposition === 'NO' ? 'text-green-400' : 'text-red-400'}`}>
              {validation.contentValidation.hasChangedComposition === 'NO' ? 'Original ✓' : 'Modified ✗'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Fidelity Score</span>
            <span className={`font-medium ${
              validation.contentValidation.fidelityScore >= 90 ? 'text-green-400' :
              validation.contentValidation.fidelityScore >= 70 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {validation.contentValidation.fidelityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Fine-grained changes (what humans notice) */}
      {validation.contentValidation.fineGrainedAttributeChanges && validation.contentValidation.fineGrainedAttributeChanges.length > 0 && (
        <div className="mt-6 bg-slate-900/50 rounded-xl p-4">
          <h4 className="font-bold mb-3 text-slate-300">Fine-Grained Perceptual Changes</h4>
          <ul className="space-y-2">
            {validation.contentValidation.fineGrainedAttributeChanges.map((c, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className={`mt-0.5 font-bold ${
                  c.severity === 'HIGH' ? 'text-red-400' : c.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {c.severity}
                </span>
                <span className="text-slate-500">[{c.area}]</span>
                <span>{c.change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Element Comparison Details */}
      {validation.elementComparison && (
        <div className="mt-6 bg-slate-900/50 rounded-xl p-4">
          <h4 className="font-bold mb-3 text-slate-300">Element-by-Element Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">People Count</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Original: {validation.elementComparison.peopleCount.original}</span>
                <span className="text-slate-600">→</span>
                <span className="font-medium">Restored: {validation.elementComparison.peopleCount.restored}</span>
                <span className={`ml-auto ${validation.elementComparison.peopleCount.match ? 'text-green-400' : 'text-red-400'}`}>
                  {validation.elementComparison.peopleCount.match ? '✓' : '✗'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Objects Count</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Original: {validation.elementComparison.objectsCount.original}</span>
                <span className="text-slate-600">→</span>
                <span className="font-medium">Restored: {validation.elementComparison.objectsCount.restored}</span>
                <span className={`ml-auto ${validation.elementComparison.objectsCount.match ? 'text-green-400' : 'text-red-400'}`}>
                  {validation.elementComparison.objectsCount.match ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
          
          {validation.elementComparison.addedElements.length > 0 && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="font-bold mb-1 text-red-400">Added Elements Detected:</div>
              <ul className="space-y-1">
                {validation.elementComparison.addedElements.map((element, index) => (
                  <li key={index} className="text-sm text-red-300 flex items-start gap-2">
                    <span>•</span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.elementComparison.removedElements.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="font-bold mb-1 text-yellow-400">Removed Elements:</div>
              <ul className="space-y-1">
                {validation.elementComparison.removedElements.map((element, index) => (
                  <li key={index} className="text-sm text-yellow-300 flex items-start gap-2">
                    <span>•</span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.elementComparison.alteredElements.length > 0 && (
            <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="font-bold mb-1 text-orange-400">Altered Elements:</div>
              <ul className="space-y-1">
                {validation.elementComparison.alteredElements.map((element, index) => (
                  <li key={index} className="text-sm text-orange-300 flex items-start gap-2">
                    <span>•</span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Issues Found */}
      {validation.contentValidation.issuesFound.length > 0 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h4 className="font-bold mb-2 text-red-400">Issues Detected</h4>
          <ul className="space-y-1">
            {validation.contentValidation.issuesFound.map((issue, index) => (
              <li key={index} className="text-sm text-red-300 flex items-start gap-2">
                <span>•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Score */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Confidence Score</span>
          <span className="text-lg font-bold text-rose-400">{validation.confidenceScore.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              validation.confidenceScore >= 90 ? 'bg-green-500' :
              validation.confidenceScore >= 70 ? 'bg-yellow-500' :
              validation.confidenceScore >= 50 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${validation.confidenceScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Low Risk</span>
          <span>High Confidence</span>
        </div>
      </div>

      {validation.overallResult === 'PASSED' && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
          <div className="text-green-400 font-medium">✅ Restoration validated successfully!</div>
          <div className="text-sm text-green-300 mt-1">The restored image accurately preserves all original content.</div>
        </div>
      )}

      {validation.overallResult === 'FAILED' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <div className="text-red-400 font-medium">⚠️ Validation warnings detected</div>
          <div className="text-sm text-red-300 mt-1">
            Some artifacts may have been introduced. Consider trying different restoration options.
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;