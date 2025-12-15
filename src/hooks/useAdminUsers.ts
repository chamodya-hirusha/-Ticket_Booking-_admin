import { useState, useEffect } from 'react';
import { adminApi } from '../services/api/admin';
import type { User, FilterOptions } from '../types/admin';
import { toast } from 'sonner@2.0.3';

export function useAdminUsers(initialFilters?: FilterOptions) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getUsers(filters);
      setUsers(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateUserStatus = async (id: string, status: User['status']) => {
    try {
      await adminApi.updateUserStatus(id, status);
      await fetchUsers();
      toast.success('User status updated successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(errorMsg);
      throw err instanceof Error ? err : new Error('Failed to update user status');
    }
  };

  return {
    users,
    isLoading,
    error,
    filters,
    setFilters,
    updateUserStatus,
    refetch: fetchUsers,
  };
}

