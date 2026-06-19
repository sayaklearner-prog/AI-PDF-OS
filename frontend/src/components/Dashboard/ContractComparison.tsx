import React, { useState } from 'react';
import axios from 'axios';
import { useEditorStore } from '../../store/editorStore';

interface ComparisonDeviation {
  clauseTitle: string;
  baseText: string;
  targetText: string;
  deviationSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactExplanation: string;
}

interface CompareResult {
  baseDocumentId: string;
  targetDocumentId: string;
  overallSimilarityScore: number;
  missingClauses: string[];
  deviations: ComparisonDeviation[];
  summary: string;
}

export const ContractComparison = () => {
  const { documentsList } = useEditorStore();
  const [baseDocId, setBaseDocId] = useState('');
  const [targetDocId, setTargetDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!baseDocId || !targetDocId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/compare`, {
        baseDocumentId: baseDocId,
        targetDocumentId: targetDocId
      });
      setResult(res.data);
      if (typeof window !== 'undefined' && (window as any).pendo) {
        (window as any).pendo.track("contract_comparison_executed", {
          baseDocumentId: baseDocId,
          targetDocumentId: targetDocId,
          overallSimilarityScore: res.data.overallSimilarityScore,
          deviationCount: res.data.deviations?.length || 0,
          missingClausesCount: res.data.missingClauses?.length || 0,
          success: true,
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to compare contracts. Ensure both have been analyzed first.');
      if (typeof window !== 'undefined' && (window as any).pendo) {
        (window as any).pendo.track("contract_comparison_executed", {
          baseDocumentId: baseDocId,
          targetDocumentId: targetDocId,
          success: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contract Comparison</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Select a base contract and a target contract to run a semantic AI diff analysis. Both documents must be uploaded and processed by the intelligence pipeline first.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Contract (The Standard)</label>
            <select 
              value={baseDocId} 
              onChange={(e) => setBaseDocId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Base Contract</option>
              {documentsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Contract (To Evaluate)</label>
            <select 
              value={targetDocId} 
              onChange={(e) => setTargetDocId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Target Contract</option>
              {documentsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleCompare}
          disabled={!baseDocId || !targetDocId || loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          {loading ? 'Analyzing Differences...' : 'Run AI Comparison'}
        </button>
        
        {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">{error}</div>}
      </div>

      {result && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Comparison Overview</h3>
              <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
            </div>
            <div className="ml-6 text-center shrink-0">
              <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-xl font-black mb-1
                ${result.overallSimilarityScore >= 80 ? 'border-green-500 text-green-600' : 
                  result.overallSimilarityScore >= 50 ? 'border-yellow-500 text-yellow-600' : 
                  'border-red-500 text-red-600'}"
                style={{ borderColor: result.overallSimilarityScore >= 80 ? '#22c55e' : result.overallSimilarityScore >= 50 ? '#eab308' : '#ef4444' }}
              >
                {result.overallSimilarityScore}%
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Similarity</span>
            </div>
          </div>

          {result.missingClauses && result.missingClauses.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-900/30">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Missing Base Clauses
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {result.missingClauses.map((missing, i) => (
                  <li key={i} className="text-red-700 dark:text-red-300 text-sm">{missing}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Clause Deviations</h3>
            <div className="space-y-6">
              {result.deviations?.map((dev, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{dev.clauseTitle}</h4>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      dev.deviationSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      dev.deviationSeverity === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      dev.deviationSeverity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {dev.deviationSeverity} DEVIATION
                    </span>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Base Contract</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">{dev.baseText}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Target Contract</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/10 p-3 rounded text-red-800 dark:text-red-200">{dev.targetText}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Business Impact of Deviation</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{dev.impactExplanation}</p>
                  </div>
                </div>
              ))}
              {(!result.deviations || result.deviations.length === 0) && (
                <div className="p-6 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  No significant deviations found between the two contracts.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
