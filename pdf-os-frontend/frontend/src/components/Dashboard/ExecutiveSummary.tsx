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
        const res = await axios.get(`http://localhost:3001/ai/contracts/${documentId}/summary`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Parties</h3>
          <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
            {JSON.stringify(parties, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Dates</h3>
          <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
            {JSON.stringify(dates, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Overview</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
          {executiveSummary.contractOverview}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Top Risks
        </h3>
        <ul className="space-y-3">
          {executiveSummary.topRisks?.map((risk: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">{i+1}</span>
              <span className="text-gray-700 dark:text-gray-300">{risk}</span>
            </li>
          ))}
          {(!executiveSummary.topRisks || executiveSummary.topRisks.length === 0) && (
            <li className="text-gray-500 italic">No critical risks detected.</li>
          )}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Financial Obligations</h3>
        <p className="text-gray-700 dark:text-gray-300 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
          {executiveSummary.financialObligations}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Recommendations
        </h3>
        <ul className="space-y-3">
          {executiveSummary.recommendations?.map((rec: string, i: number) => (
            <li key={i} className="flex items-start bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <span className="text-green-500 mr-2">•</span>
              <span className="text-gray-700 dark:text-gray-300">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
