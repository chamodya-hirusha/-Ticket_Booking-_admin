import { useState, useEffect } from 'react';
import { adminApi } from '../services/api/admin';
import type { Ticket, FilterOptions } from '../types/admin';

export function useAdminTickets(initialFilters?: FilterOptions) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tickets'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const updateTicketStatus = async (id: string, status: Ticket['status']) => {
    try {
      const updatedTicket = await adminApi.updateTicketStatus(id, status);
      setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      return updatedTicket;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update ticket');
    }
  };

  return {
    tickets,
    isLoading,
    error,
    filters,
    setFilters,
    updateTicketStatus,
    refetch: fetchTickets,
  };
}
