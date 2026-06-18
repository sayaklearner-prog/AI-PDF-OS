import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export const ExecutiveSummary = ({ documentId }: { documentId: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/${documentId}/summary`);
        setData(res.data);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setError('Summary not yet available. Please wait for the analysis to complete.');
        } else {
          setError('Failed to load executive summary.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [documentId]);

  const exportToPDF = async () => {
    if (!summaryRef.current) return;
    setExporting(true);
    try {
      const imgData = await toPng(summaryRef.current, { cacheBust: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Contract_Summary_${contractType || 'Document'}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to generate PDF report.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Executive Summary...</div>;
  if (error) return <div className="p-8 text-center text-amber-600">{error}</div>;
  if (!data) return null;

  const { executiveSummary, contractType, parties, dates } = data;

  return (
    <div ref={summaryRef} className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 my-8">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Executive Summary</h2>
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-semibold">
            {contractType || 'Unknown Contract Type'}
          </span>
        </div>
        <button 
          onClick={exportToPDF}
          disabled={exporting}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md shadow hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50"
        >
          {exporting ? 'Generating PDF...' : 'Export to PDF'}
        </button>
      </div>



      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Overview</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {typeof executiveSummary.contractOverview === 'string'
              ? executiveSummary.contractOverview || 'The contract details are currently unspecified...'
              : JSON.stringify(executiveSummary.contractOverview)}
          </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          General Risk Factors
        </h3>
        <ul className="space-y-3">
          {executiveSummary.riskFactors?.map((risk: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">{i+1}</span>
              <span className="text-gray-700 dark:text-gray-300">{risk}</span>
            </li>
          ))}
          {(!executiveSummary.riskFactors || executiveSummary.riskFactors.length === 0) && (
            <li className="text-gray-500 italic">No general risks detected.</li>
          )}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-amber-500 dark:text-amber-400 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Financial Risk & Exposure
        </h3>
        <p className="text-gray-700 dark:text-gray-300 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
          {typeof executiveSummary.financialRisks === 'string' 
            ? executiveSummary.financialRisks 
            : Array.isArray(executiveSummary.financialRisks) 
              ? executiveSummary.financialRisks.join(' ') 
              : JSON.stringify(executiveSummary.financialRisks)}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          Critical Awareness
        </h3>
        <ul className="space-y-3">
          {executiveSummary.criticalAwareness?.map((item: string, i: number) => (
            <li key={i} className="flex items-start bg-purple-50 dark:bg-purple-900/10 p-3 rounded-md border border-purple-100 dark:border-purple-900/20">
              <span className="text-purple-500 font-bold mr-3">!</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Required Changes & Redlines
        </h3>
        <ul className="space-y-3">
          {executiveSummary.requiredChanges?.map((change: string, i: number) => (
            <li key={i} className="flex items-start bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-cyan-500 shadow-sm">
              <span className="text-cyan-500 mt-1 mr-3 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">{change}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
