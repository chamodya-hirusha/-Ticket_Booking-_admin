import { useState } from 'react';
import { Eye, UserCheck, UserX, Ban } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { User } from '../../types/admin';
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

export function Users() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { users, isLoading, updateUserStatus, refetch, setFilters } = useAdminUsers({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handleStatusUpdate = async (userId: string, status: User['status']) => {
    try {
      await updateUserStatus(userId, status);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-foreground">{user.name}</p>
          </div>
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
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <span className="capitalize text-foreground">{user.role}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedUser(user)}
            title="View details"
          >
            <Eye className="size-4" />
          </Button>
          {user.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusUpdate(user.id, 'suspended')}
              title="Suspend user"
            >
              <Ban className="size-4 text-orange-600" />
            </Button>
          )}
          {user.status === 'suspended' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusUpdate(user.id, 'active')}
              title="Activate user"
            >
              <UserCheck className="size-4 text-green-600" />
            </Button>
          )}
          {user.status !== 'inactive' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusUpdate(user.id, 'inactive')}
              title="Deactivate user"
            >
              <UserX className="size-4 text-red-600" />
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
          <h1 className="text-foreground">Users Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all users on your platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setFilters({
              status: value === 'all' ? undefined : value,
            });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl p-6">
        <DataTable
          data={users}
          columns={columns}
          searchable
          searchPlaceholder="Search users..."
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-foreground mt-1">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground mt-1">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-foreground mt-1 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-foreground mt-1">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Booking Stats */}
              <div className="pt-4 border-t">
                <h3 className="text-foreground mb-4">Booking Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-foreground mt-1">{selectedUser.totalBookings}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-foreground mt-1">${selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                <Select
                  value={selectedUser.status}
                  onValueChange={(value: User['status']) => {
                    handleStatusUpdate(selectedUser.id, value);
                    setSelectedUser(null);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
