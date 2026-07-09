'use client';

import { useEffect, useState } from 'react';

interface Application {
  id: string;
  role: string;
  company: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  location?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  applications: Application[];
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch candidates from our running Fastify backend
  useEffect(() => {
    fetch('http://localhost:3001/api/candidates')
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching candidates:', err);
        setLoading(false);
      });
  }, []);

  // Helper styling badges for Application Statuses
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-lg font-medium text-slate-500 animate-pulse">Loading talent pipelines...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidate Tracker</h1>
        <p className="text-slate-500 mt-1">Review applicant tracking pipelines and job applications.</p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                <th className="px-6 py-4">Candidate Profile</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Active Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name & Location */}
                  <td className="px-6 py-5 vertical-top">
                    <div className="font-semibold text-slate-900 text-base">{candidate.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{candidate.location || 'Remote'}</div>
                    {candidate.notes && (
                      <p className="text-slate-500 text-xs mt-2 italic bg-slate-50 p-2 rounded border border-dashed border-slate-200 max-w-sm">
                        "{candidate.notes}"
                      </p>
                    )}
                  </td>

                  {/* Contact Methods */}
                  <td className="px-6 py-5 vertical-top text-slate-600">
                    <div>{candidate.email}</div>
                    <div className="text-xs text-slate-400 mt-1">{candidate.phone || 'No phone profile'}</div>
                    {candidate.linkedin_url && (
                      <a 
                        href={candidate.linkedin_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-block text-xs font-medium text-blue-600 hover:underline mt-2"
                      >
                        LinkedIn Profile →
                      </a>
                    )}
                  </td>

                  {/* Nested Applications */}
                  <td className="px-6 py-5">
                    {candidate.applications.length === 0 ? (
                      <span className="text-slate-400 text-xs italic">No job applications linked</span>
                    ) : (
                      <div className="space-y-3">
                        {candidate.applications.map((app) => (
                          <div key={app.id} className="flex items-center justify-between gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                            <div>
                              <div className="font-medium text-slate-800">{app.role}</div>
                              <div className="text-xs text-slate-400">{app.company}</div>
                            </div>
                            <span className={getStatusBadgeClass(app.status)}>
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}