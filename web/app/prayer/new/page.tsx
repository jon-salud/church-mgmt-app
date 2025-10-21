'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { clientApi } from '@/lib/api.client';
import { useState } from 'react';

export default function NewPrayerRequestPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await clientApi.post('/prayer-requests', {
      title,
      description,
      isAnonymous,
    });
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Prayer Request Submitted</h1>
        <p>Thank you for submitting your prayer request. It will be reviewed by our pastoral team shortly.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Submit a Prayer Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-600 rounded-md p-2 bg-slate-800 text-slate-100"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-600 rounded-md p-2 bg-slate-800 text-slate-100"
            rows={4}
            required
          />
        </div>
        <div className="flex items-center">
          <Checkbox id="isAnonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))} />
          <label htmlFor="isAnonymous" className="ml-2 text-sm">
            Submit anonymously
          </label>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
