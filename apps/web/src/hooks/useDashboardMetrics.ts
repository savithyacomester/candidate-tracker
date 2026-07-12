import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface DashboardMetrics {
  totalCandidates: number;
  applied: number;
  screening: number;
  interview: number;
  hired: number;
  rejected: number;
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/metrics'); // Adjust endpoint path if needed
      return response.data;
    },
  });
}