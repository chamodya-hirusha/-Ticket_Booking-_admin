import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

type Status = 
  | 'draft' | 'published' | 'cancelled'
  | 'pending' | 'confirmed' | 'used' | 'refunded'
  | 'active' | 'inactive' | 'suspended'
  | 'approved' | 'rejected'
  | 'completed' | 'failed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // Event statuses
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  published: { label: 'Published', className: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-300' },
  
  // Ticket statuses
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  used: { label: 'Used', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  refunded: { label: 'Refunded', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  
  // User/Vendor statuses
  active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-300' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800 border-red-300' },
  
  // Vendor statuses
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-300' },
  
  // Payment statuses
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-300' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-300' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
