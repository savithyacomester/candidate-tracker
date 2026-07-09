'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  source: string;
  notes?: string;
  applied_at: string;
  candidate: {
    name: string;
    email: string;
    location?: string;
  };
}

interface ApplicationsResponse {
  data: Application[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Implement client-side debouncing to protect backend throughput
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search terms
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch from the multi-field cross-entity search endpoint
  const { data, isLoading, isError } = useQuery<ApplicationsResponse>({
    queryKey: ['applications', debouncedSearch, statusFilter, page],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res = await fetch(`http://localhost:3001/api/applications?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch search results');
      return res.json();
    },
  });

  const getStatusBadgeClass = (status: Application['status']) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide capitalize ";
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Applications Explorer</h1>
          <p className="text-slate-500 mt-1">Cross-entity server database search engine.</p>
        </div>
        <a href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
          ← Back to Metrics Dashboard
        </a>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Search Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by job, company, source, notes, candidate name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 capitalize"
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse font-medium">
              Querying database registry...
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-600 font-medium">
              Error fetching pipeline data from server.
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic">
              No matching cross-entity items found.
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    <th className="px-6 py-4">Job Info</th>
                    <th className="px-6 py-4">Candidate Link</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {data.data.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{app.job_title}</div>
                        <div className="text-slate-500 text-xs">{app.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{app.candidate.name}</div>
                        <div className="text-slate-400 text-xs">{app.candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{app.source}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(app.status)}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination UI Controls */}
              {data.meta.totalPages > 1 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Showing Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total items)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 text-xs font-medium border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === data.meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 text-xs font-medium border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}