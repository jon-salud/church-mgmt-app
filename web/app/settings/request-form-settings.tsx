'use client';

import { useState, useEffect, useCallback } from 'react';
import { clientApi } from '../../lib/api.client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { RequestType } from '../../lib/types';

function SortableItem({
  requestType,
  onUpdate,
  onArchive,
  onToggleActive,
}: {
  requestType: RequestType;
  onUpdate: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: requestType.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(requestType.name);

  const handleSave = () => {
    onUpdate(requestType.id, name);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg bg-background p-2"
    >
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <Switch
        id={`request-type-${requestType.id}`}
        checked={requestType.status === 'active'}
        onCheckedChange={checked => onToggleActive(requestType.id, checked)}
      />
      {isEditing ? (
        <Input value={name} onChange={e => setName(e.target.value)} className="flex-grow" />
      ) : (
        <span className="flex-grow">{requestType.name}</span>
      )}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        ) : (
          !requestType.isBuiltIn && (
            <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
          )
        )}
        {!requestType.isBuiltIn && (
          <Button onClick={() => onArchive(requestType.id)} size="sm" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function RequestFormSettings() {
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [newRequestTypeName, setNewRequestTypeName] = useState('');
  const [newRequestTypeDescription, setNewRequestTypeDescription] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchRequestTypes = useCallback(async () => {
    if (!churchId) return;
    const types = await clientApi.getRequestTypes(churchId);
    setRequestTypes(types.sort((a, b) => a.displayOrder - b.displayOrder));
  }, [churchId]);

  useEffect(() => {
    async function init() {
      const me = await clientApi.currentUser();
      const id = me?.user?.roles[0]?.churchId;
      if (id) {
        setChurchId(id);
      }
    }
    init();
  }, []);

  useEffect(() => {
    fetchRequestTypes();
  }, [fetchRequestTypes]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = requestTypes.findIndex(item => item.id === active.id);
      const newIndex = requestTypes.findIndex(item => item.id === over!.id);
      const newOrder = arrayMove(requestTypes, oldIndex, newIndex);
      setRequestTypes(newOrder);
      if (churchId) {
        await clientApi.reorderRequestTypes(
          churchId,
          newOrder.map(rt => rt.id)
        );
        alert('Request type order saved!');
      }
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    if (churchId) {
      await clientApi.updateRequestType(churchId, id, name);
      fetchRequestTypes();
      alert('Request type updated!');
    }
  };

  const handleArchive = async (id: string) => {
    if (churchId) {
      try {
        await clientApi.archiveRequestType(churchId, id);
        fetchRequestTypes();
        alert('Request type archived!');
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    if (churchId) {
      await clientApi.updateRequestTypeStatus(churchId, id, active ? 'active' : 'archived');
      fetchRequestTypes();
      alert('Request type status updated!');
    }
  };

  const [newRequestTypeHasConfidential, setNewRequestTypeHasConfidential] = useState(false);

  const handleAddRequestType = async () => {
    if (churchId && newRequestTypeName) {
      await clientApi.createRequestType(
        churchId,
        newRequestTypeName,
        newRequestTypeHasConfidential,
        newRequestTypeDescription,
      );
      setNewRequestTypeName('');
      setNewRequestTypeDescription('');
      setNewRequestTypeHasConfidential(false);
      setIsAddDialogOpen(false);
      fetchRequestTypes();
      alert('Request type added!');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-foreground">Request Form Settings</h2>
      <p className="mt-2 text-muted-foreground">
        Manage the request types available to members in the unified request form.
      </p>

      <div className="mt-6 space-y-4">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={requestTypes.map(rt => rt.id)}>
            {requestTypes.map(rt => (
              <SortableItem
                key={rt.id}
                requestType={rt}
                onUpdate={handleUpdate}
                onArchive={handleArchive}
                onToggleActive={handleToggleActive}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-6">
        <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Request Type
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Request Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Request type name"
              value={newRequestTypeName}
              onChange={e => setNewRequestTypeName(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={newRequestTypeDescription}
              onChange={e => setNewRequestTypeDescription(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="confidential-switch"
                checked={newRequestTypeHasConfidential}
                onCheckedChange={setNewRequestTypeHasConfidential}
              />
              <label htmlFor="confidential-switch">Has Confidential Field</label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddRequestType}>Add Request Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
