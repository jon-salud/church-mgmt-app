'use client';

import { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Input } from '@/components/ui-flowbite/input';
import { Label } from '@/components/ui-flowbite/label';
import { Textarea } from '@/components/ui-flowbite/textarea';

export default function FlowbiteTestPage() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Flowbite Component Test</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        <div className="flex gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Form Elements</h2>

        <div>
          <Label htmlFor="test-input">Input Field</Label>
          <Input
            id="test-input"
            type="text"
            placeholder="Enter some text..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Value: {inputValue}</p>
        </div>

        <div>
          <Label htmlFor="test-textarea">Textarea Field</Label>
          <Textarea
            id="test-textarea"
            placeholder="Enter some text..."
            value={textareaValue}
            onChange={e => setTextareaValue(e.target.value)}
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">Value: {textareaValue}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dark Mode Test</h2>
        <p className="text-muted-foreground">
          Toggle dark mode using the theme switcher in the header to test theme compatibility.
        </p>
      </div>
    </div>
  );
}
