'use client';

import { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Input } from '@/components/ui-flowbite/input';
import { Label } from '@/components/ui-flowbite/label';
import { Textarea } from '@/components/ui-flowbite/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui-flowbite/card';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Progress } from '@/components/ui-flowbite/progress';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui-flowbite/table';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui-flowbite/select';
import { Modal } from '@/components/ui-flowbite/modal';
import { PageHeader } from '@/components/ui-flowbite/page-header';

export default function FlowbiteTestPage() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [progress, setProgress] = useState(45);
  const [selectValue, setSelectValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Flowbite Component Test">
        <p className="text-muted-foreground">Testing all 13 Flowbite wrapper components</p>
      </PageHeader>

      <div className="container mx-auto p-8 space-y-8">
        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
            <CardDescription>Test different button variants and states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Input, Textarea, Label, Checkbox, and Select components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="flex items-center space-x-2">
              <Checkbox id="test-checkbox" checked={isChecked} onCheckedChange={setIsChecked} />
              <Label htmlFor="test-checkbox">Accept terms and conditions</Label>
            </div>

            <div>
              <Label htmlFor="test-select">Select Option</Label>
              <Select value={selectValue} onValueChange={setSelectValue}>
                <SelectTrigger id="test-select">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">Selected: {selectValue || 'None'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Component */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Component</CardTitle>
            <CardDescription>Dynamic progress bar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button onClick={() => setProgress(Math.max(0, progress - 10))}>Decrease</Button>
              <Button onClick={() => setProgress(Math.min(100, progress + 10))}>Increase</Button>
              <span className="text-sm text-gray-500">Current: {progress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Table Component */}
        <Card>
          <CardHeader>
            <CardTitle>Table Component</CardTitle>
            <CardDescription>Data table with header and rows</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>Leader</TableCell>
                  <TableCell>Inactive</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Component */}
        <Card>
          <CardHeader>
            <CardTitle>Modal Component</CardTitle>
            <CardDescription>Click to open modal dialog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </CardContent>
        </Card>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Test Modal"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
            </div>
          }
        >
          <p>
            This is a test modal with Flowbite styling. All components maintain backward
            compatibility with the original API.
          </p>
        </Modal>

        {/* Dark Mode Test */}
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Test</CardTitle>
            <CardDescription>
              Toggle dark mode using the theme switcher in the header
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All components should adapt correctly to light and dark themes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
