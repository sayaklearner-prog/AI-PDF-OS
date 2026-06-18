import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Calendar } from 'lucide-react';

export default function SidebarSummary({ documentId }: { documentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/${documentId}/summary`);
        setData(res.data);
      } catch (e: any) {
        setError('Loading...');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500 text-sm animate-pulse">Analyzing contract data...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-gray-500 text-sm">Summary not yet available.</div>;
  }

  const { executiveSummary } = data;

  // Calculate a mock risk score out of 10 based on risk factors length for now
  const riskCount = executiveSummary.riskFactors?.length || 0;
  const criticalCount = executiveSummary.criticalAwareness?.length || 0;
  let rawScore = 10 - (riskCount * 1) - (criticalCount * 2);
  if (rawScore < 1) rawScore = 1;
  if (rawScore > 10) rawScore = 10;
  
  let scoreColor = 'text-green-400';
  let scoreBg = 'bg-green-400/10 border-green-400/20';
  if (rawScore <= 4) {
    scoreColor = 'text-red-400';
    scoreBg = 'bg-red-400/10 border-red-400/20';
  } else if (rawScore <= 7) {
    scoreColor = 'text-amber-400';
    scoreBg = 'bg-amber-400/10 border-amber-400/20';
  }

  return (
    <div className="p-5 space-y-6 overflow-y-auto">
      {/* Risk Score */}
      <div className="flex flex-col items-center">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Overall Safety Score</h3>
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg backdrop-blur-md ${scoreBg}`} style={{ borderColor: scoreColor.replace('text-', '') }}>
          <div className="text-center">
            <span className={`text-3xl font-black ${scoreColor}`}>{rawScore}</span>
            <span className="text-gray-500 text-sm font-bold">/10</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          {rawScore >= 8 ? 'Low Risk Document' : rawScore >= 5 ? 'Moderate Risk Document' : 'High Risk Document'}
        </p>
      </div>

      <hr className="border-white/5" />

      {/* Parties Involved */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" /> Parties Involved
        </h3>
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          {Array.isArray(executiveSummary.parties) && executiveSummary.parties.length > 0 ? (
            <ul className="space-y-2">
              {executiveSummary.parties.map((party: string, i: number) => (
                <li key={i} className="flex items-center text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 shrink-0"></span>
                  <span className="truncate" title={party}>{party}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-gray-500 italic">No parties identified.</span>
          )}
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Key Dates */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-cyan-400" /> Key Dates
        </h3>
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Effective Date</span>
            <span className="text-xs text-white font-medium bg-white/5 px-2 py-1.5 rounded inline-block">
              {executiveSummary.keyDates?.effectiveDate || 'Not specified'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Expiration Date</span>
            <span className="text-xs text-white font-medium bg-white/5 px-2 py-1.5 rounded inline-block">
              {executiveSummary.keyDates?.expirationDate || 'Not specified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
