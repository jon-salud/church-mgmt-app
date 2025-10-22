
'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { clientApi } from '../../lib/api.client';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const [requestType, setRequestType] = useState('');
  const router = useRouter();

  const getFormDescription = () => {
    switch (requestType) {
      case 'PRAYER':
        return 'Share your prayer requests with the pastoral team. You can choose to share them publicly on the Prayer Wall.';
      case 'BENEVOLENCE':
        return 'If you are in need of financial assistance, please describe your situation. This request is confidential.';
      case 'IMPROVEMENT':
      case 'SUGGESTION':
        return 'Have an idea to improve the church or a suggestion for a new activity? We would love to hear it. Please include any proposed solutions.';
      default:
        return 'Please select a request type to get started.';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      type: formData.get('type'),
      title: formData.get('title'),
      body: formData.get('body'),
      isConfidential: formData.get('isConfidential') === 'on',
    };

    try {
      await clientApi.post('/requests', data);
      router.push('/pastoral-care');
    } catch (error) {
      console.error('Failed to submit request:', error);
      // Handle error state here, e.g., show a toast notification
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Member Request Form</CardTitle>
          <CardDescription>{getFormDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-type">Request Type</Label>
            <Select name="type" onValueChange={setRequestType}>
              <SelectTrigger id="request-type">
                <SelectValue placeholder="Select a request type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRAYER">Prayer Request</SelectItem>
                <SelectItem value="BENEVOLENCE">Benevolence Request</SelectItem>
                <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                <SelectItem value="SUGGESTION">Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {requestType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Enter a title for your request" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Details</Label>
                <Textarea id="body" name="body" placeholder="Please provide as much detail as possible." required />
              </div>
              {(requestType === 'PRAYER' || requestType === 'BENEVOLENCE') && (
                <div className="flex items-center space-x-2">
                  <Input type="checkbox" id="isConfidential" name="isConfidential" />
                  <Label htmlFor="isConfidential">Keep this request confidential (pastoral staff only)</Label>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!requestType}>Submit Request</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
