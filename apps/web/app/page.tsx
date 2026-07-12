'use client';

import Link from 'next/link';
import { useDashboardMetrics } from '../src/hooks/useDashboardMetrics';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: 'applied' | 'screening' | 'interview' | 'hired' | 'rejected';
  applied_at: string;
  candidate: {
    name: string;
    email: string;
  };
}

export default function Dashboard() {
  // Use your global state query hook directly
  const { data: metrics, isLoading, isError, refetch } = useDashboardMetrics();

  // Helper styling badges matching your layout aesthetics
  const getStatusBadgeClass = (status: Application['status']) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize ";
    switch (status) {
      case 'hired': return base + "bg-green-100 text-green-800 border border-green-200";
      case 'interview': return base + "bg-blue-100 text-blue-800 border border-blue-200";
      case 'screening': return base + "bg-purple-100 text-purple-800 border border-purple-200";
      case 'applied': return base + "bg-gray-100 text-gray-800 border border-gray-200";
      case 'rejected': return base + "bg-red-100 text-red-800 border border-red-200";
      default: return base + "bg-gray-100 text-gray-800";
    }
  };

  // Loading state handling with custom spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-500 animate-pulse">Aggregating live pipelines...</p>
        </div>
      </div>
    );
  }

  // Error fallback state 
  if (isError || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Failed to load pipeline summary</p>
          <p className="text-slate-500 text-sm mb-6">The API engine was unreachable. Verify your backend Fastify connection stack is active.</p>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Call
          </button>
        </div>
      </div>
    );
  }

  // Transform metrics object into a local iterable status breakdown array
  const statusBreakdown = [
    { status: 'applied', count: metrics.applied ?? 0 },
    { status: 'screening', count: metrics.screening ?? 0 },
    { status: 'interview', count: metrics.interview ?? 0 },
    { status: 'hired', count: metrics.hired ?? 0 },
    { status: 'rejected', count: metrics.rejected ?? 0 },
  ];

  const maxCount = Math.max(...statusBreakdown.map(s => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Talent Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time recruitment health metrics and tracking aggregations.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/candidates"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            Browse Talent Pool
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards Summary Section */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Screening</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.screening ?? 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.interview ?? 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hired</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.hired ?? 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{metrics.rejected ?? 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.totalCandidates ?? 0}</p>
          </div>
        </div>

        {/* Application Pipeline Chart Breakdown */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wider">Applications By Status</h2>
            <div className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-slate-600">{item.status}</span>
                    <span className="text-slate-900 font-bold">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}