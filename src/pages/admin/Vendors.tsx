import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { adminApi } from '../../services/api/admin';
import { userServiceAPI } from '../../services/api/userService';
import type { Vendor } from '../../types/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from 'sonner@2.0.3';

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorWebsite, setNewVendorWebsite] = useState('');
  const [newVendorPassword, setNewVendorPassword] = useState('');

  useEffect(() => {
    loadVendors();
  }, [statusFilter]);

  const loadVendors = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getVendors({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (vendorId: string, status: Vendor['status']) => {
    try {
      await adminApi.updateVendorStatus(vendorId, status);
      await loadVendors();
      
      const actionMessage = 
        status === 'approved' ? 'Vendor approved successfully' :
        status === 'rejected' ? 'Vendor rejected' :
        status === 'suspended' ? 'Vendor suspended' :
        'Vendor status updated';
      
      toast.success(actionMessage);
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVendorName || !newVendorEmail || !newVendorPassword) {
      toast.error('Name, email and password are required');
      return;
    }

    try {
      setIsCreatingVendor(true);
      const response = await userServiceAPI.vendorRegister({
        name: newVendorName,
        email: newVendorEmail,
        phone: newVendorPhone,
        website: newVendorWebsite,
        password: newVendorPassword,
      });

      if (response.success) {
        toast.success(response.message || 'Vendor created successfully');
        setIsAddVendorOpen(false);
        setNewVendorName('');
        setNewVendorEmail('');
        setNewVendorPhone('');
        setNewVendorWebsite('');
        setNewVendorPassword('');
        await loadVendors();
      } else {
        toast.error(response.message || 'Failed to create vendor');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create vendor');
      } else {
        toast.error('Failed to create vendor');
      }
    } finally {
      setIsCreatingVendor(false);
    }
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (vendor) => (
        <div>
          <p className="text-foreground">{vendor.companyName}</p>
          <p className="text-sm text-muted-foreground">{vendor.name}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
    },
    {
      key: 'totalEvents',
      label: 'Events',
      sortable: true,
      render: (vendor) => (
        <p className="text-foreground">{vendor.totalEvents}</p>
      ),
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      render: (vendor) => (
        <p className="text-foreground">${vendor.totalRevenue.toLocaleString()}</p>
      ),
    },
    {
      key: 'createdAt',
      label: 'Applied',
      sortable: true,
      render: (vendor) => (
        <p className="text-foreground">
          {new Date(vendor.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (vendor) => <StatusBadge status={vendor.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (vendor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedVendor(vendor)}
            title="View details"
          >
            <Eye className="size-4" />
          </Button>
          {vendor.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                title="Approve vendor"
              >
                <CheckCircle className="size-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                title="Reject vendor"
              >
                <XCircle className="size-4 text-red-600" />
              </Button>
            </>
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
          <h1 className="text-foreground">Vendors Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor applications and accounts
          </p>
        </div>
        <Button onClick={() => setIsAddVendorOpen(true)}>
          Add Vendor
        </Button>
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl p-6">
        <DataTable
          data={vendors}
          columns={columns}
          searchable
          searchPlaceholder="Search vendors..."
          isLoading={isLoading}
          emptyMessage="No vendors found"
        />
      </div>

      {/* Vendor Details Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedVendor?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Vendor Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="text-foreground mt-1">{selectedVendor.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="text-foreground mt-1">{selectedVendor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground mt-1">{selectedVendor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground mt-1">{selectedVendor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedVendor.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied</p>
                  <p className="text-foreground mt-1">
                    {new Date(selectedVendor.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="pt-4 border-t">
                <h3 className="text-foreground mb-4">Performance Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-foreground mt-1">{selectedVendor.totalEvents}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-foreground mt-1">${selectedVendor.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                {selectedVendor.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedVendor.id, 'approved');
                        setSelectedVendor(null);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedVendor.id, 'rejected');
                        setSelectedVendor(null);
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="size-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                
                {selectedVendor.status !== 'pending' && (
                  <Select
                    value={selectedVendor.status}
                    onValueChange={(value: Vendor['status']) => {
                      handleStatusUpdate(selectedVendor.id, value);
                      setSelectedVendor(null);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>
              Create a new vendor account. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                placeholder="Contact person name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email *
              </label>
              <input
                type="email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                placeholder="vendor@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone
              </label>
              <input
                type="tel"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newVendorPhone}
                onChange={(e) => setNewVendorPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Website
              </label>
              <input
                type="url"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newVendorWebsite}
                onChange={(e) => setNewVendorWebsite(e.target.value)}
                placeholder="https://vendor-website.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password *
              </label>
              <input
                type="password"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newVendorPassword}
                onChange={(e) => setNewVendorPassword(e.target.value)}
                placeholder="Temporary password for vendor"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddVendorOpen(false)}
                disabled={isCreatingVendor}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingVendor}>
                {isCreatingVendor ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
