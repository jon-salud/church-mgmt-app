'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui-flowbite/table';
import { Button } from '@/components/ui-flowbite/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui-flowbite/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui-flowbite/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-flowbite/select';
import { RequestType, User } from '@/lib/types';
import { hasRole } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'pastoral-care-type-filter';

export function PastoralCareClientPage({
  data: initialData,
  requestTypes: initialRequestTypes,
  user,
}: {
  data: any[];
  requestTypes: RequestType[];
  user: User;
}) {
  const [data] = useState(initialData);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [requestTypes] = useState<RequestType[]>(initialRequestTypes);
  // Initialize with all types selected, or load from localStorage
  const [typeFilter, setTypeFilter] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return initialRequestTypes.map(rt => rt.id);
        }
      }
    }
    return initialRequestTypes.map(rt => rt.id);
  });
  const [sortOrder, setSortOrder] = useState('newest');
  const typeMap = useMemo(() => new Map(requestTypes.map(rt => [rt.id, rt.name])), [requestTypes]);

  // Persist filter changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(typeFilter));
    }
  }, [typeFilter]);

  const allTypesSelected = typeFilter.length === requestTypes.length;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(
        item => (item.status || 'Pending').toLowerCase().replace(' ', '-') === statusFilter
      );
    }

    // Filter by type - show nothing if no types are selected
    result = result.filter(item => {
      if (typeFilter.length === 0) {
        return false; // Show nothing when no types selected
      }
      // Show items that match selected types or are Pastoral Care tickets
      return item.type === 'Pastoral Care' || typeFilter.includes(item.requestTypeId);
    });

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [data, statusFilter, typeFilter, sortOrder]);

  const hasAdminOrLeaderRole = hasRole(user?.roles, 'admin') || hasRole(user?.roles, 'leader');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Pastoral Care & Requests</h1>
        <div className="flex gap-2">
          <a
            id="new-request-link"
            href="/requests"
            className="inline-flex items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/80"
          >
            New Request
          </a>
          {hasAdminOrLeaderRole && (
            <a
              id="new-ticket-link"
              href="/pastoral-care/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              New Ticket
            </a>
          )}
        </div>
      </div>
      <div className="flex space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-10 w-[180px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <span>
              {allTypesSelected
                ? 'All Types'
                : typeFilter.length === 0
                  ? 'No Types Selected'
                  : `${typeFilter.length} selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Request Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={allTypesSelected}
              onCheckedChange={checked => {
                setTypeFilter(checked ? requestTypes.map(t => t.id) : []);
              }}
            >
              Select All
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {requestTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type.id}
                checked={typeFilter.includes(type.id)}
                onCheckedChange={checked => {
                  setTypeFilter(
                    checked ? [...typeFilter, type.id] : typeFilter.filter(id => id !== type.id)
                  );
                }}
              >
                {type.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[180px]" aria-label="Sort order">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.type || typeMap.get(item.requestTypeId)}</TableCell>
              <TableCell>
                {item.author
                  ? `${item.author.profile.firstName} ${item.author.profile.lastName}`
                  : 'N/A'}
              </TableCell>
              <TableCell>{item.status || 'Pending'}</TableCell>
              <TableCell>{new Date(item.createdAt).toISOString().split('T')[0]}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedItem(item)}>
                      View Details
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>
                <strong>Type:</strong>{' '}
                {selectedItem.type || typeMap.get(selectedItem.requestTypeId)}
              </p>
              <p>
                <strong>Author:</strong>{' '}
                {selectedItem.author
                  ? `${selectedItem.author.profile.firstName} ${selectedItem.author.profile.lastName}`
                  : 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedItem.status || 'Pending'}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {new Date(selectedItem.createdAt).toISOString().split('T')[0]}
              </p>
              <p>
                <strong>Details:</strong>
              </p>
              <p>{selectedItem.body || selectedItem.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
