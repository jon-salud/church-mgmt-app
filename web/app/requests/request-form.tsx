'use client';

import { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui-flowbite/card';
import { Label } from '@/components/ui-flowbite/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-flowbite/select';
import { Textarea } from '@/components/ui-flowbite/textarea';
import { Input } from '@/components/ui-flowbite/input';
import { clientApi } from '@/lib/api.client';
import { RequestType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Declare browser globals for ESLint
declare const alert: (message: string) => void;
declare const setTimeout: (callback: () => void, delay: number) => number;

interface RequestFormProps {
  initialRequestTypes: RequestType[];
  churchId: string;
}

export function RequestForm({ initialRequestTypes, churchId: _churchId }: RequestFormProps) {
  const [requestTypeId, setRequestTypeId] = useState('');
  const [requestTypes] = useState<RequestType[]>(initialRequestTypes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getFormDescription = () => {
    const selectedType = requestTypes.find(rt => rt.id === requestTypeId);
    if (selectedType) {
      return selectedType.description;
    }
    return 'Please select a request type to get started.';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      requestTypeId: formData.get('requestTypeId'),
      title: formData.get('title'),
      body: formData.get('body'),
      isConfidential: formData.get('isConfidential') === 'on',
    };

    try {
      await clientApi.post('/requests', data);
      setSubmitSuccess(true);

      // Wait a bit for the backend to process, then redirect
      setTimeout(() => {
        // Use window.location to force a full page reload with fresh data
        window.location.href = '/pastoral-care';
      }, 1500);
    } catch (error) {
      console.error('Failed to submit request:', error);
      setIsSubmitting(false);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="heading-2">Member Request Form</h2>
          <p className="caption-text">{getFormDescription()}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-type">Request Type</Label>
            <div className="relative">
              <Select name="requestTypeId" onValueChange={setRequestTypeId}>
                <SelectTrigger id="request-type" data-testid="request-type-select">
                  <SelectValue placeholder="Select a request type..." />
                </SelectTrigger>
                <SelectContent aria-label="Request Type">
                  {requestTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {requestTypeId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter a title for your request"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Details</Label>
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Please provide as much detail as possible."
                  required
                />
              </div>
              {requestTypes.find(rt => rt.id === requestTypeId)?.hasConfidentialField && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isConfidential"
                    name="isConfidential"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <Label htmlFor="isConfidential" className="cursor-pointer">
                    Keep this request confidential (pastoral staff only)
                  </Label>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          {submitSuccess && (
            <div className="w-full rounded-md bg-primary/10 p-3 text-sm text-primary dark:bg-primary/20 dark:text-primary">
              ✓ Request submitted successfully! Redirecting...
            </div>
          )}
          <Button type="submit" disabled={!requestTypeId || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
