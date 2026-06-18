import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Clause {
  id: string;
  title: string;
  text: string;
  type: string;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  businessImpact: string;
  recommendation: string;
  rewriteStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  proposedRewrite: string | null;
  rewriteExplanation: string | null;
}

export const ClauseExplorer = ({ documentId }: { documentId: string }) => {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClauses = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/${documentId}/clauses`);
      setClauses(res.data);
    } catch (e) {
      console.error('Failed to fetch clauses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClauses();
  }, [documentId]);

  const handleRewriteAction = async (clauseId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/clauses/${clauseId}/${action}-rewrite`);
      // Optimistic update
      setClauses(clauses.map(c => 
        c.id === clauseId 
          ? { ...c, rewriteStatus: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } 
          : c
      ));
    } catch (e) {
      console.error('Failed to update rewrite status', e);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading clauses...</div>;
  if (clauses.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Clause Analysis & Negotiation
      </h3>
      
      <div className="space-y-6">
        {clauses.map(clause => (
          <div key={clause.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 dark:text-white">{clause.title || clause.type || 'Unnamed Clause'}</h4>
              
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                clause.riskSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                clause.riskSeverity === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                clause.riskSeverity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {clause.riskSeverity} RISK ({clause.riskScore})
              </span>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Text</span>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-100 dark:border-gray-800">
                  {clause.text}
                </p>
              </div>

              {clause.riskSeverity !== 'LOW' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md border border-red-100 dark:border-red-900/20">
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">Business Impact</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{clause.businessImpact}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/20">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">Recommendation</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{clause.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Negotiation Rewrite Section */}
              {clause.proposedRewrite && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-400">AI Proposed Rewrite</span>
                    
                    {clause.rewriteStatus === 'ACCEPTED' && <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">ACCEPTED</span>}
                    {clause.rewriteStatus === 'REJECTED' && <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">REJECTED</span>}
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                    <p className="text-sm text-gray-800 dark:text-gray-200 italic mb-3">"{clause.proposedRewrite}"</p>
                    
                    <div className="text-xs text-purple-600 dark:text-purple-300 bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-800/50 mb-3">
                      <strong>Strategy:</strong> {clause.rewriteExplanation}
                    </div>

                    {clause.rewriteStatus === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleRewriteAction(clause.id, 'accept')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                          Accept Rewrite
                        </button>
                        <button 
                          onClick={() => handleRewriteAction(clause.id, 'reject')}
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
