'use client';

import { useQuery } from '@tanstack/react-query';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  applied_at: string;
  candidate: {
    name: string;
    email: string;
  };
}

interface DashboardMetrics {
  totalCandidates: number;
  totalApplications: number;
  applicationsByStatus: { status: string; count: number }[];
  hiredThisMonth: number;
  rejectionRate: number;
  latestApplications: Application[];
}

export default function Dashboard() {
  // Enforce Section 5.1: Use TanStack React Query for managing server state
  const { data: metrics, isLoading, isError, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3001/api/dashboard');
      if (!res.ok) throw new Error('Network error pulling metrics');
      return res.json();
    },
  });

  // Helper styling badges for Application Statuses
  const getStatusBadgeClass = (status: Application['status']) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize ";
    switch (status) {
      case 'hired': return base + "bg-green-100 text-green-800 border border-green-200";
      case 'offer': return base + "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case 'interview': return base + "bg-blue-100 text-blue-800 border border-blue-200";
      case 'screening': return base + "bg-purple-100 text-purple-800 border border-purple-200";
      case 'applied': return base + "bg-gray-100 text-gray-800 border border-gray-200";
      case 'rejected': return base + "bg-red-100 text-red-800 border border-red-200";
      default: return base + "bg-gray-100 text-gray-800";
    }
  };

  // Section 5.2 Loading UI State handling
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

  // Section 5.2 Error UI State handling with Retry function
  if (isError || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Failed to load pipeline summary</p>
          <p className="text-slate-500 text-sm mb-6">The API engine was unreachable. Verify your backend Fastify connection stack is up.</p>
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

  // Calculate high value for simple status bar scaling calculations
  const maxCount = Math.max(...metrics.applicationsByStatus.map(s => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Talent Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time recruitment health metrics and tracking aggregations.</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* ==========================================
            SECTION 3.1: SIX REQUIRED KPI CARDS
           ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalCandidates}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalApplications}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hired This Month</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.hiredThisMonth}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejection Rate</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{metrics.rejectionRate}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Status Pools</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.applicationsByStatus.length}</p>
          </div>
        </div>

        {/* ==========================================
            SECTION 3.2: RESPONSIVE APPLICATION PIPELINE CHART
           ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wider">Applications By Status</h2>
            <div className="space-y-4">
              {metrics.applicationsByStatus.map((item) => (
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
              {metrics.applicationsByStatus.length === 0 && (
                <p className="text-slate-400 text-sm italic">No application pipelines active.</p>
              )}
            </div>
          </div>

          {/* ==========================================
              SECTION 3.1: LATEST ACTIVITY PIPELINE FEED
             ========================================== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Latest Application Activities</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {metrics.latestApplications.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-sm">
                  <div>
                    <div className="font-semibold text-slate-800">{app.job_title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {app.company} • Applied by <span className="font-medium text-slate-600">{app.candidate.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={getStatusBadgeClass(app.status)}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
              {metrics.latestApplications.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic">No recent applications registered.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}