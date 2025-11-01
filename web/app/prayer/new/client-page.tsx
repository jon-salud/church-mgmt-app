'use client';

import { Button } from '@/components/ui-flowbite/button';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { clientApi } from '@/lib/api.client';
import { useState, useEffect } from 'react';

export function NewPrayerRequestClientPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      console.log('Submitting prayer request...');
      await clientApi.post('/requests', {
        requestTypeId: 'req-type-1', // Prayer request type
        title,
        body: description,
        isConfidential: isAnonymous,
      });
      console.log('Prayer request submitted successfully');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit prayer request. Please try again.');
    }
  }

  // Redirect after showing success message
  useEffect(() => {
    if (isSubmitted) {
      // eslint-disable-next-line no-undef
      const timer = setTimeout(() => {
        window.location.href = '/prayer';
      }, 2000);
      // eslint-disable-next-line no-undef
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  if (isSubmitted) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Prayer Request Submitted</h1>
        <p>
          Thank you for submitting your prayer request. It will be reviewed by our pastoral team
          shortly.
        </p>
        <p className="mt-4 text-sm text-gray-500">Redirecting to prayer wall...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Submit a Prayer Request</h1>
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
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
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-slate-600 rounded-md p-2 bg-slate-800 text-slate-100"
            rows={4}
            required
          />
        </div>
        <div className="flex items-center">
          <Checkbox
            id="isAnonymous"
            checked={isAnonymous}
            onCheckedChange={checked => setIsAnonymous(Boolean(checked))}
          />
          <label htmlFor="isAnonymous" className="ml-2 text-sm">
            Submit anonymously
          </label>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
