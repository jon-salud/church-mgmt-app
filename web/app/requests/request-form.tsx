'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { clientApi } from '@/lib/api.client';
import { useRouter } from 'next/navigation';
import { RequestType } from '@/lib/types';

interface RequestFormProps {
  initialRequestTypes: RequestType[];
  churchId: string;
}

export function RequestForm({ initialRequestTypes, churchId: _churchId }: RequestFormProps) {
  const [requestTypeId, setRequestTypeId] = useState('');
  const [requestTypes] = useState<RequestType[]>(initialRequestTypes);
  const router = useRouter();

  const getFormDescription = () => {
    const selectedType = requestTypes.find(rt => rt.id === requestTypeId);
    if (selectedType) {
      return selectedType.description;
    }
    return 'Please select a request type to get started.';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      requestTypeId: formData.get('requestTypeId'),
      title: formData.get('title'),
      body: formData.get('body'),
      isConfidential: formData.get('isConfidential') === 'on',
    };

    try {
      await clientApi.post('/requests', data);
      router.push('/pastoral-care');
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            Member Request Form
          </h2>
          <p className="text-sm text-muted-foreground">{getFormDescription()}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-type">Request Type</Label>
            <Select name="requestTypeId" onValueChange={setRequestTypeId}>
              <SelectTrigger id="request-type">
                <SelectValue placeholder="Select a request type..." />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map(rt => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <Input type="checkbox" id="isConfidential" name="isConfidential" />
                  <Label htmlFor="isConfidential">
                    Keep this request confidential (pastoral staff only)
                  </Label>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!requestTypeId}>
            Submit Request
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
