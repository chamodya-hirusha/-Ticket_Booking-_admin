import { useState, useEffect } from 'react';
import { adminApi } from '../services/api/admin';
import type { Event, EventFormData, FilterOptions } from '../types/admin';
import { toast } from 'sonner@2.0.3';

export function useAdminEvents(initialFilters?: FilterOptions) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getEvents(filters);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const createEvent = async (data: EventFormData) => {
    try {
      const newEvent = await adminApi.createEvent(data);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create event';
      toast.error(errorMsg);
      throw err instanceof Error ? err : new Error('Failed to create event');
    }
  };

  const updateEvent = async (id: string, data: Partial<EventFormData>) => {
    try {
      const updatedEvent = await adminApi.updateEvent(id, data);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
      return updatedEvent;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update event';
      toast.error(errorMsg);
      throw err instanceof Error ? err : new Error('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await adminApi.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete event';
      toast.error(errorMsg);
      throw err instanceof Error ? err : new Error('Failed to delete event');
    }
  };

  return {
    events,
    isLoading,
    error,
    filters,
    setFilters,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
