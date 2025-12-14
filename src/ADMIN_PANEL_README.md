# Admin Panel - Ticket Booking Platform

A comprehensive admin panel for managing a ticket booking platform built with React, TypeScript, and Shadcn UI components.

## Features

### 📊 Dashboard
- **Key Metrics**: Total events, tickets sold, revenue, active users
- **Revenue Charts**: Monthly revenue visualization using Recharts
- **Ticket Distribution**: Pie chart showing tickets by status
- **Recent Bookings**: Latest ticket bookings with status
- **Upcoming Events**: Next scheduled events with details

### 🎫 Events Management
- View all events in a sortable, filterable table
- Create new events with detailed form validation
- Edit existing events
- Delete events with confirmation
- Duplicate events
- Filter by status (Draft/Published/Cancelled) and category
- Search functionality
- Image upload support via URL

### 🎟️ Tickets Management
- View all ticket bookings
- Filter by status (Pending/Confirmed/Used/Cancelled/Refunded)
- Mark tickets as used or validated
- View detailed ticket information
- Export ticket data to CSV
- Ticket status updates

### 👥 Users Management
- List all registered users
- View user profiles and booking history
- Activate/Deactivate user accounts
- Suspend users
- Filter by user status
- Search users by name or email
- View booking statistics per user

### 🏪 Vendors Management
- List all vendor applications
- Approve/Reject vendor applications
- View vendor details and performance
- Manage vendor status (Approved/Rejected/Suspended/Pending)
- Track vendor events and revenue
- Filter by vendor status

### 💳 Payments & Transactions
- View all payment transactions
- Filter by payment status and method
- Process refunds
- Payment details view
- Revenue statistics
- Export payment data to CSV
- Track completed, pending, and failed payments

### ⚙️ Settings
- General platform settings
- Email notification preferences
- Security settings (2FA, session timeout)
- Payment gateway configuration
- Platform commission settings
- Password management

## Tech Stack

- **React**: UI framework
- **TypeScript**: Type-safe development
- **Shadcn UI**: Component library
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Tailwind CSS**: Styling

## File Structure

```
/
├── types/
│   └── admin.ts                 # TypeScript interfaces
├── services/
│   └── api/
│       └── admin.ts             # API service with mock data
├── hooks/
│   ├── useAdminAuth.ts          # Authentication hook
│   ├── useAdminStats.ts         # Dashboard statistics hook
│   ├── useAdminEvents.ts        # Events CRUD operations hook
│   └── useAdminTickets.ts       # Tickets management hook
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx      # Main layout component
│   │   ├── AdminSidebar.tsx     # Navigation sidebar
│   │   ├── AdminHeader.tsx      # Top header with notifications
│   │   ├── StatsCard.tsx        # Reusable stats card
│   │   ├── StatusBadge.tsx      # Status indicator component
│   │   ├── DataTable.tsx        # Reusable data table with sorting/filtering
│   │   └── EventForm.tsx        # Event create/edit form
│   └── ui/                      # Shadcn UI components
├── pages/
│   └── admin/
│       ├── Dashboard.tsx        # Dashboard page
│       ├── Events.tsx           # Events management page
│       ├── Tickets.tsx          # Tickets management page
│       ├── Users.tsx            # Users management page
│       ├── Vendors.tsx          # Vendors management page
│       ├── Payments.tsx         # Payments & transactions page
│       └── Settings.tsx         # Settings page
└── App.tsx                      # Main application component
```

## Components

### AdminLayout
Main layout component with:
- Collapsible sidebar navigation
- Mobile-responsive menu
- Top header with user menu and notifications
- Theme toggle (light/dark mode)

### AdminSidebar
Navigation sidebar featuring:
- All admin sections
- Active page highlighting
- Collapse/expand functionality
- Mobile overlay support

### AdminHeader
Top header bar with:
- Admin profile dropdown
- Notification center (3 mock notifications)
- Theme toggle
- Mobile menu button
- Logout functionality

### StatsCard
Reusable card for displaying metrics:
- Icon display
- Title and value
- Trend indicator (optional)
- Description text

### StatusBadge
Status indicator with predefined colors for:
- Event statuses (Draft, Published, Cancelled)
- Ticket statuses (Pending, Confirmed, Used, Refunded)
- User statuses (Active, Inactive, Suspended)
- Vendor statuses (Approved, Rejected, Pending)
- Payment statuses (Completed, Failed, Pending)

### DataTable
Advanced table component with:
- Column sorting
- Search functionality
- Pagination (10 items per page)
- Loading states
- Empty states
- Custom cell rendering

### EventForm
Comprehensive form for events with:
- Form validation
- All event fields
- Date/time pickers
- Category selection
- Status selection
- Image URL input
- Error handling

## API Service

The `admin.ts` service includes mock data and simulates API calls with:
- Async operations with delays
- CRUD operations for all entities
- Filtering and search functionality
- Error handling

### Available API Methods:
- `getStats()` - Dashboard statistics
- `getEvents(filters)` - Fetch events with filters
- `createEvent(data)` - Create new event
- `updateEvent(id, data)` - Update event
- `deleteEvent(id)` - Delete event
- `getTickets(filters)` - Fetch tickets
- `updateTicketStatus(id, status)` - Update ticket status
- `getUsers(filters)` - Fetch users
- `updateUserStatus(id, status)` - Update user status
- `getVendors(filters)` - Fetch vendors
- `updateVendorStatus(id, status)` - Update vendor status
- `getPayments(filters)` - Fetch payments
- `refundPayment(id, amount)` - Process refund

## Mock Data

The admin panel includes comprehensive mock data:
- 4 sample events (Music Festival, Tech Conference, Art Exhibition, Food Festival)
- 3 sample ticket bookings
- 3 sample users
- 3 sample vendors
- 3 sample payment transactions
- Dashboard statistics with charts data

## Features Implemented

✅ Role-based access control (Admin only)
✅ Protected routes with authentication check
✅ Responsive design (mobile, tablet, desktop)
✅ Search and filtering on all tables
✅ Pagination for large datasets
✅ Export functionality (CSV)
✅ Real-time toast notifications
✅ Form validation
✅ Error handling and loading states
✅ Dark/light theme support
✅ Collapsible sidebar
✅ Mobile menu overlay
✅ Status management for all entities
✅ Bulk actions (status updates)
✅ Data visualization (charts and graphs)

## Usage

The admin panel automatically loads when the application starts. The authentication is simulated, and an admin user is automatically logged in for demonstration purposes.

### Navigation
Use the sidebar to navigate between different sections:
- Dashboard
- Events
- Tickets
- Users
- Vendors
- Payments
- Settings

### Quick Actions
- **Create Event**: Click the "Create Event" button on the Events page
- **Edit Event**: Click the edit icon in the Actions column
- **Delete Event**: Click the delete icon (confirmation required)
- **Duplicate Event**: Click the copy icon to duplicate an event
- **Approve Vendor**: Click the checkmark on pending vendors
- **Process Refund**: Click the refund icon on completed payments
- **Export Data**: Click the "Export Data" button to download CSV

## Customization

### To connect to a real backend:
1. Update the API service in `/services/api/admin.ts`
2. Replace mock data calls with actual API endpoints
3. Update the authentication logic in `/hooks/useAdminAuth.ts`
4. Add proper error handling for network failures

### To modify the theme:
1. Edit `/styles/globals.css` for color tokens
2. Update component styles as needed
3. Theme toggle is available in the header

### To add new pages:
1. Create a new page component in `/pages/admin/`
2. Add a route in the sidebar navigation
3. Update the App.tsx switch statement
4. Add necessary API endpoints and hooks

## Notes

- All data is currently mocked and stored in memory
- Authentication is simulated for demonstration
- Images use Unsplash URLs for demonstration
- CSV exports generate client-side only
- In production, replace with real API calls and database
- Not meant for collecting PII or securing sensitive data in current form
