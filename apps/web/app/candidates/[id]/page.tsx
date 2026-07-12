'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  source: string;
  applied_at: string;
}

interface CandidateDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: string;
  applications: Application[];
}

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: candidate, isLoading, isError, refetch } = useQuery<CandidateDetails>({
    queryKey: ['candidateDetails', id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/candidates/${id}`);
      if (!res.ok) {
        throw new Error('Failed to resolve candidate record metadata.');
      }
      return res.json();
    },
    enabled: !!id,
  });

  // Mutation to handle real-time status adjustments
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, newStatus }: { applicationId: string; newStatus: string }) => {
      const res = await fetch(`http://localhost:3001/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update application pipeline status.');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateDetails', id] });
    },
  });

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId, newStatus });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Compiling candidate structural profiles...</p>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-xl border border-rose-200 text-center max-w-sm shadow-xs">
          <p className="text-rose-700 font-semibold text-sm">Target candidate profile could not be reached.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 bg-rose-600 text-white px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-rose-700 transition"
          >
            Retry Connection Action
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link href="/candidates" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Talent Pool
          </Link>
          <span className="text-xs text-slate-400 font-mono">ID: {candidate.id}</span>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{candidate.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Candidate profile parsed registry data.</p>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
              <span className="text-slate-800 font-medium block mt-1">{candidate.email}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Link</span>
              <span className="text-slate-800 font-medium block mt-1">{candidate.phone || 'No phone registered'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Geographic Location</span>
              <span className="text-slate-800 font-medium block mt-1">{candidate.location || 'Remote / Unspecified'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn URL</span>
              {candidate.linkedin_url ? (
                <a 
                  href={candidate.linkedin_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 hover:underline font-medium block mt-1"
                >
                  View External Professional Bio →
                </a>
              ) : (
                <span className="text-slate-400 italic block mt-1">No link provided</span>
              )}
            </div>
          </div>

          {candidate.notes && (
            <div className="pt-2">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Professional Notes</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                {candidate.notes}
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Historical Submissions</h2>
            <p className="text-xs text-slate-400 mt-0.5">All applications assigned to this user profile record.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  <th className="px-6 py-4">Job Details</th>
                  <th className="px-6 py-4">Sourced Via</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4 text-right">Pipeline Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {candidate.applications?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-slate-400 italic">
                      This candidate has not applied for any active job listings yet.
                    </td>
                  </tr>
                ) : (
                  candidate.applications?.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{app.job_title}</div>
                        <div className="text-slate-500 text-xs">{app.company}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 capitalize">{app.source}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(app.applied_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={getStatusBadgeClass(app.status)}>
                            {app.status}
                          </span>
                          <select
                            value={app.status}
                            disabled={updateStatusMutation.isPending}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-40"
                          >
                            <option value="applied">Applied</option>
                            <option value="screening">Screening</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}