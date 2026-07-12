import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'applied' | 'screening' | 'interview' | 'hired' | 'rejected';
  position: string;
  createdAt: string;
}

interface UseCandidatesFilters {
  search?: string;
  status?: string;
}

export function useCandidates(filters: UseCandidatesFilters = {}) {
  return useQuery<Candidate[]>({
    queryKey: ['candidates', filters],
    queryFn: async () => {
      const response = await api.get('/api/candidates', {
        params: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          // The backend query logic handles excluding `isDeleted: true`
        },
      });
      return response.data;
    },
  });
}