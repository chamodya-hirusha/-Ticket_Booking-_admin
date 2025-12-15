import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { EventForm } from '../../components/admin/EventForm';
import { useAdminEvents } from '../../hooks/useAdminEvents';
import type { Event, EventFormData } from '../../types/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner@2.0.3';

type ViewMode = 'list' | 'edit';

export function Events() {
  const { events, isLoading, updateEvent, deleteEvent, filters, setFilters } = useAdminEvents();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);


  const handleUpdate = async (data: EventFormData) => {
    if (!selectedEvent) return;
    
    try {
      await updateEvent(selectedEvent.id, data);
      setViewMode('list');
      setSelectedEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete.id);
      setEventToDelete(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const columns: Column<Event>[] = [
    {
      key: 'name',
      label: 'Event Name',
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-3">
          {event.imageUrl && (
            <img 
              src={event.imageUrl} 
              alt={event.name}
              className="size-10 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="text-foreground">{event.name}</p>
            <p className="text-sm text-muted-foreground">{event.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (event) => (
        <div>
          <p className="text-foreground">
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-muted-foreground">{event.time}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (event) => (
        <p className="text-foreground max-w-xs truncate">{event.location}</p>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (event) => (
        <p className="text-foreground">${event.price.toFixed(2)}</p>
      ),
    },
    {
      key: 'availableTickets',
      label: 'Tickets',
      sortable: true,
      render: (event) => (
        <div>
          <p className="text-foreground">{event.availableTickets}</p>
          <p className="text-sm text-muted-foreground">of {event.totalTickets}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (event) => <StatusBadge status={event.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (event) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewEvent(event)}
            title="View details"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedEvent(event);
              setViewMode('edit');
            }}
            title="Edit event"
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEventToDelete(event)}
            title="Delete event"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (viewMode === 'edit' && selectedEvent) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" onClick={() => {
            setViewMode('list');
            setSelectedEvent(null);
          }}>
            ← Back to Events
          </Button>
        </div>
        <div className="max-w-4xl">
          <h1 className="text-foreground mb-6">Edit Event</h1>
          <div className="bg-card border rounded-xl p-6">
            <EventForm
              event={selectedEvent}
              onSubmit={handleUpdate}
              onCancel={() => {
                setViewMode('list');
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all events on your platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value: string) =>
            setFilters({ ...filters, status: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value: string) =>
            setFilters({ ...filters, category: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Music">Music</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Art">Art</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl p-6">
        <DataTable
          data={events}
          columns={columns}
          searchable
          searchPlaceholder="Search events..."
          onSearch={(query) => setFilters({ ...filters, search: query })}
          isLoading={isLoading}
          emptyMessage="No events found"
        />
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about {viewEvent?.name}
            </DialogDescription>
          </DialogHeader>

          {viewEvent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-3">
                  {viewEvent.imageUrl && (
                    <img
                      src={viewEvent.imageUrl}
                      alt={viewEvent.name}
                      className="size-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-foreground text-lg font-semibold">{viewEvent.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {viewEvent.category}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="text-foreground mt-1">
                    {new Date(viewEvent.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at {viewEvent.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground mt-1">{viewEvent.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={viewEvent.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="text-foreground mt-1">
                    {new Date(viewEvent.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t">
                <h3 className="text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {viewEvent.description}
                </p>
              </div>

              {/* Ticket Tiers */}
              <div className="pt-4 border-t">
                <h3 className="text-foreground mb-4">Ticket Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-muted-foreground">General</p>
                    <p className="text-foreground mt-1">
                      {viewEvent.generalTicketLimit ?? viewEvent.availableTickets} tickets
                    </p>
                    <p className="text-foreground mt-1">
                      ${viewEvent.generalTicketPrice ?? viewEvent.price}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-muted-foreground">Premium</p>
                    <p className="text-foreground mt-1">
                      {viewEvent.premiumTicketLimit ?? 0} tickets
                    </p>
                    <p className="text-foreground mt-1">
                      ${viewEvent.premiumTicketPrice ?? 0}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-muted-foreground">VIP</p>
                    <p className="text-foreground mt-1">
                      {viewEvent.vipTicketLimit ?? 0} tickets
                    </p>
                    <p className="text-foreground mt-1">
                      ${viewEvent.vipTicketPrice ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
