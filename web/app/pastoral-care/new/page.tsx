'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { clientApi } from '@/lib/api.client';

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = await clientApi.createPastoralCareTicket({ title, description, priority });
    router.push(`/pastoral-care/${newTicket.id}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Pastoral Care Ticket</h1>
      <p className="text-gray-600">
        Your request is confidential and will only be seen by the pastoral care team.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 border rounded-md">
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
