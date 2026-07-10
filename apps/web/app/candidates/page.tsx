'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: string;
  applications?: any[];
}

interface ApiResponse {
  data: Candidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field State Definitions
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  // 1. Fetch Candidates List via React Query (Triggers automatically when page or search modifications occur)
  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['candidates', search, page],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      });
      const response = await fetch(`http://localhost:3002/api/candidates?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidate profiles.');
      }
      return response.json();
    },
  });

  // 2. Handle New Candidate Generation Mutation with 409 Conflict Parsing
  const createMutation = useMutation({
    mutationFn: async (newCandidate: typeof formData) => {
      const response = await fetch('http://localhost:3002/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate),
      });

      if (response.status === 409) {
        throw new Error('A candidate profile with this email address already exists.');
      }
      if (!response.ok) {
        throw new Error('An error occurred while creating the candidate.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', location: '', linkedin_url: '', notes: '' });
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(error.message);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Candidate name and email address are strictly required.');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Talent Pool</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, filter, and onboard global company candidates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition"
        >
          Add New Candidate
        </button>
      </div>

      {/* Search Input Bar (Section 4.1 Requirement) */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by candidate name, email, phone, or location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset layout back to primary index page during typing cycles
          }}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Grid List View Display Handler */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Compiling and fetching active talent entries...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500 text-sm">Error accessing database records. Confirm Fastify cluster connection points.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="p-4">Candidate Profile</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Geographic Location</th>
                <th className="p-4">Applications Stack</th>
                <th className="p-4 text-right">Reference Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">No candidate listings match your search criteria.</td>
                </tr>
              ) : (
                data?.data.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-medium text-slate-900">{candidate.name}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span>{candidate.email}</span>
                        {candidate.phone && <span className="text-xs text-slate-400 mt-0.5">{candidate.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{candidate.location || 'Remote / Unspecified'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {candidate.applications?.length || 0} Open File(s)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {candidate.linkedin_url ? (
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-medium text-xs"
                        >
                          LinkedIn Profile →
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs italic">No external link</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controllers Block */}
          {data && data.meta.totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Displaying page <strong>{data.meta.page}</strong> of {data.meta.totalPages} ({data.meta.total} total candidate entries)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-white text-xs border rounded shadow-sm hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  disabled={page === data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-white text-xs border rounded shadow-sm hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal Overlay Form Element */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-lg p-6 space-y-4 relative">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Candidate Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill out parameters to populate database records.</p>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g., Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g., jane.doe@domain.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-slate-300 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="Enter interviewer tags, skills, or background references..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving Record...' : 'Confirm and Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}