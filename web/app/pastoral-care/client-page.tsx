
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export function PastoralCareClientPage({ data: initialData }: { data: any[] }) {
  const [data, setData] = useState(initialData);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pastoral Care & Requests</h1>
        <Link
          id="new-request-link"
          href="/requests"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          New Request
        </Link>
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
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.requestTypeId}</TableCell>
              <TableCell>{item.author ? `${item.author.profile.firstName} ${item.author.profile.lastName}`: 'N/A'}</TableCell>
              <TableCell>{item.status || 'Pending'}</TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => setSelectedItem(item)}>View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedItem && (
        <Modal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
        >
          <div className="p-4">
            <p><strong>Type:</strong> {selectedItem.requestTypeId}</p>
            <p><strong>Author:</strong> {selectedItem.author ? `${selectedItem.author.profile.firstName} ${selectedItem.author.profile.lastName}`: 'N/A'}</p>
            <p><strong>Status:</strong> {selectedItem.status || 'Pending'}</p>
            <p><strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleString()}</p>
            <p><strong>Details:</strong></p>
            <p>{selectedItem.body || selectedItem.description}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
