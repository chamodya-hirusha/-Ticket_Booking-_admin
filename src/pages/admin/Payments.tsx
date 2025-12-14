import { useState, useEffect } from 'react';
import { Download, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { StatsCard } from '../../components/admin/StatsCard';
import { adminApi } from '../../services/api/admin';
import type { Payment } from '../../types/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner@2.0.3';
import { CreditCard, TrendingUp, CheckCircle } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; payment: Payment | null }>({
    open: false,
    payment: null,
  });
  const [refundAmount, setRefundAmount] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPayments({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundDialog.payment) return;
    
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > refundDialog.payment.amount) {
      toast.error('Invalid refund amount');
      return;
    }

    try {
      await adminApi.refundPayment(refundDialog.payment.id, amount);
      await loadPayments();
      setRefundDialog({ open: false, payment: null });
      setRefundAmount('');
      toast.success('Refund processed successfully');
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Payment ID', 'Ticket ID', 'User ID', 'Amount', 'Status', 'Payment Method', 'Date'],
      ...payments.map(p => [
        p.id,
        p.ticketId,
        p.userId,
        p.amount,
        p.status,
        p.paymentMethod,
        new Date(p.transactionDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    
    toast.success('Payments exported successfully');
  };

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const columns: Column<Payment>[] = [
    {
      key: 'id',
      label: 'Payment ID',
      sortable: true,
      render: (payment) => (
        <button
          onClick={() => setSelectedPayment(payment)}
          className="text-primary hover:underline"
        >
          {payment.id}
        </button>
      ),
    },
    {
      key: 'ticketId',
      label: 'Ticket ID',
      sortable: true,
    },
    {
      key: 'userId',
      label: 'User ID',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (payment) => (
        <p className="text-foreground">${payment.amount.toFixed(2)}</p>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      sortable: true,
      render: (payment) => (
        <span className="capitalize text-foreground">
          {payment.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'transactionDate',
      label: 'Date',
      sortable: true,
      render: (payment) => (
        <p className="text-foreground">
          {new Date(payment.transactionDate).toLocaleDateString('en-US', {
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
      render: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (payment) => (
        <div className="flex items-center gap-2">
          {payment.status === 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRefundDialog({ open: true, payment });
                setRefundAmount(payment.amount.toString());
              }}
              title="Process refund"
            >
              <RefreshCw className="size-4" />
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
          <h1 className="text-foreground">Payments & Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage all payment transactions
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="All completed payments"
        />
        <StatsCard
          title="Completed"
          value={completedPayments}
          icon={CheckCircle}
          description="Successful transactions"
        />
        <StatsCard
          title="Pending"
          value={pendingPayments}
          icon={CreditCard}
          description="Awaiting confirmation"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl p-6">
        <DataTable
          data={payments}
          columns={columns}
          searchable
          searchPlaceholder="Search payments..."
          isLoading={isLoading}
          emptyMessage="No payments found"
        />
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Payment ID: {selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket ID</p>
                  <p className="text-foreground mt-1">{selectedPayment.ticketId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="text-foreground mt-1">{selectedPayment.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-foreground mt-1">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-foreground mt-1 capitalize">
                    {selectedPayment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Date</p>
                  <p className="text-foreground mt-1">
                    {new Date(selectedPayment.transactionDate).toLocaleDateString('en-US', {
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
                    <StatusBadge status={selectedPayment.status} />
                  </div>
                </div>
                {selectedPayment.refundAmount && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="text-foreground mt-1">${selectedPayment.refundAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Date</p>
                      <p className="text-foreground mt-1">
                        {selectedPayment.refundDate && new Date(selectedPayment.refundDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => setRefundDialog({ open, payment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment for transaction {refundDialog.payment?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2"
                max={refundDialog.payment?.amount}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum refund: ${refundDialog.payment?.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialog({ open: false, payment: null });
                setRefundAmount('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRefund}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
