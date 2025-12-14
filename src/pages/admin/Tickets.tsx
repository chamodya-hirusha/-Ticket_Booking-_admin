import { useState } from 'react';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminTickets } from '../../hooks/useAdminTickets';
import type { Ticket } from '../../types/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

export function Tickets() {
  const { tickets, isLoading, updateTicketStatus, filters, setFilters } = useAdminTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleStatusUpdate = async (ticketId: string, status: Ticket['status']) => {
    try {
      await updateTicketStatus(ticketId, status);
      toast.success('Ticket status updated successfully');
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/PDF
    const csv = [
      ['Booking Ref', 'Event ID', 'User ID', 'Quantity', 'Total Price', 'Status', 'Purchase Date'],
      ...tickets.map(t => [
        t.bookingReference,
        t.eventId,
        t.userId,
        t.quantity,
        t.totalPrice,
        t.status,
        new Date(t.purchaseDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    
    toast.success('Tickets exported successfully');
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'bookingReference',
      label: 'Booking Reference',
      sortable: true,
      render: (ticket) => (
        <button
          onClick={() => setSelectedTicket(ticket)}
          className="text-primary hover:underline"
        >
          {ticket.bookingReference}
        </button>
      ),
    },
    {
      key: 'eventId',
      label: 'Event ID',
      sortable: true,
    },
    {
      key: 'userId',
      label: 'User ID',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (ticket) => (
        <p className="text-foreground">{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</p>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Total Price',
      sortable: true,
      render: (ticket) => (
        <p className="text-foreground">${ticket.totalPrice.toFixed(2)}</p>
      ),
    },
    {
      key: 'purchaseDate',
      label: 'Purchase Date',
      sortable: true,
      render: (ticket) => (
        <p className="text-foreground">
          {new Date(ticket.purchaseDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (ticket) => (
        <div className="flex items-center gap-2">
          {ticket.status === 'confirmed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusUpdate(ticket.id, 'used')}
              title="Mark as used"
            >
              <CheckCircle className="size-4 text-green-600" />
            </Button>
          )}
          {(ticket.status === 'confirmed' || ticket.status === 'pending') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusUpdate(ticket.id, 'cancelled')}
              title="Cancel ticket"
            >
              <XCircle className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Tickets Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all ticket bookings
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => 
            setFilters({ ...filters, status: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl p-6">
        <DataTable
          data={tickets}
          columns={columns}
          searchable
          searchPlaceholder="Search tickets..."
          onSearch={(query) => setFilters({ ...filters, search: query })}
          isLoading={isLoading}
          emptyMessage="No tickets found"
        />
      </div>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Booking Reference: {selectedTicket?.bookingReference}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event ID</p>
                  <p className="text-foreground mt-1">{selectedTicket.eventId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="text-foreground mt-1">{selectedTicket.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-foreground mt-1">{selectedTicket.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-foreground mt-1">${selectedTicket.totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="text-foreground mt-1">
                    {new Date(selectedTicket.purchaseDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="text-foreground mt-1">{selectedTicket.paymentId}</p>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value: Ticket['status']) => {
                    handleStatusUpdate(selectedTicket.id, value);
                    setSelectedTicket(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
