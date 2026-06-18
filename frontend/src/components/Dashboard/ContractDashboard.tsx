import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const ContractDashboard = ({ documentId }: { documentId: string }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/${documentId}/status`);
        setStatus(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 5 seconds if not completed
    const interval = setInterval(() => {
      if (status?.status !== 'COMPLETED' && status?.status !== 'FAILED') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documentId, status?.status]);

  if (loading) return <div className="p-4 text-gray-500">Loading analysis status...</div>;
  if (!status) return <div className="p-4 text-gray-500">No analysis available.</div>;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contract Intelligence Pipeline</h3>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status: {status.status}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${status.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {status.status === 'FAILED' && (
        <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
          Error: {status.errorMessage}
        </div>
      )}

      {status.status === 'COMPLETED' && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400 font-medium">Analysis Complete!</p>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Executive Summary and Risk Analysis are now available.
          </p>
        </div>
      )}
    </div>
  );
};
