import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  analysis: AnalysisResult;
}

const AnalysisPanel: React.FC<Props> = ({ analysis }) => {
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="glass rounded-3xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-rose-400">🔍</span> Image Analysis Results
      </h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Overall Condition</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            analysis.overallCondition === 'EXCELLENT' ? 'bg-green-500/20 text-green-400' :
            analysis.overallCondition === 'GOOD' ? 'bg-blue-500/20 text-blue-400' :
            analysis.overallCondition === 'FAIR' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {analysis.overallCondition}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-bold mb-3 text-slate-300">Detected Defects</h4>
        <div className="space-y-3">
          {analysis.defects.map((defect, index) => (
            <div key={index} className="p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{defect.type.replace('_', ' ')}</span>
                <span className={`text-xs font-bold ${severityColor(defect.severity)}`}>
                  {defect.severity}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{defect.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Fix: {defect.estimatedFixTime}</span>
                <span className={`px-2 py-0.5 rounded ${
                  defect.severity === 'HIGH' ? 'bg-red-500/20' :
                  defect.severity === 'MEDIUM' ? 'bg-yellow-500/20' :
                  'bg-green-500/20'
                }`}>
                  Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-bold mb-3 text-slate-300">Color Analysis</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Saturation</div>
            <div className="font-medium">{analysis.colorAnalysis.saturationLevel}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Contrast</div>
            <div className="font-medium">{analysis.colorAnalysis.contrastLevel}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">White Balance</div>
            <div className="font-medium">{analysis.colorAnalysis.whiteBalance}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Color Cast</div>
            <div className="font-medium">{analysis.colorAnalysis.colorCast}</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold mb-3 text-slate-300">Recommendations</h4>
        <ul className="space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-rose-400 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisPanel;