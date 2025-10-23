
'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { clientApi as api } from '@/lib/api.client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequestType } from '@/lib/types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const optionalFields = [
  { id: 'membershipStatus', label: 'Membership Status' },
  { id: 'joinMethod', label: 'Join Method' },
  { id: 'joinDate', label: 'Join Date' },
  { id: 'previousChurch', label: 'Previous Church' },
  { id: 'baptismDate', label: 'Baptism Date' },
  { id: 'spiritualGifts', label: 'Spiritual Gifts' },
  { id: 'coursesAttended', label: 'Courses Attended' },
  { id: 'maritalStatus', label: 'Marital Status' },
  { id: 'weddingAnniversary', label: 'Wedding Anniversary' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'school', label: 'School' },
  { id: 'gradeLevel', label: 'Grade Level' },
  { id: 'graduationYear', label: 'Graduation Year' },
  { id: 'skillsAndInterests', label: 'Skills and Interests' },
  { id: 'backgroundCheckStatus', label: 'Background Check Status' },
  { id: 'backgroundCheckDate', label: 'Background Check Date' },
  { id: 'onboardingComplete', label: 'Onboarding Complete' },
  { id: 'emergencyContactName', label: 'Emergency Contact Name' },
  { id: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  { id: 'allergiesOrMedicalNotes', label: 'Allergies or Medical Notes' },
  { id: 'parentalConsentOnFile', label: 'Parental Consent on File' },
  { id: 'pastoralNotes', label: 'Pastoral Notes' },
];

export default function SettingsPage() {
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const [churchId, setChurchId] = useState<string | null>(null);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [newRequestTypeName, setNewRequestTypeName] = useState('');
  const [newRequestTypeDescription, setNewRequestTypeDescription] = useState('');
  const [newRequestTypeHasConfidential, setNewRequestTypeHasConfidential] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const me = await api.currentUser();
      const id = me?.user?.roles[0]?.churchId;
      if (id) {
        setChurchId(id);
        const settings = await api.getSettings(id);
        setEnabledFields(settings.optionalFields ?? {});
        const types = await api.getRequestTypes(id);
        setRequestTypes(types);
      }
    }
    fetchSettings();
  }, []);

  const handleFieldToggle = (fieldId: string) => {
    setEnabledFields(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleSaveChanges = async () => {
    if (churchId) {
      await api.updateSettings(churchId, { optionalFields: enabledFields });
      alert('Configuration saved!');
    }
  };

  const handleCreateRequestType = async () => {
    if (churchId && newRequestTypeName) {
      const newType = await api.createRequestType(churchId, newRequestTypeName, newRequestTypeHasConfidential, newRequestTypeDescription);
      setRequestTypes([...requestTypes, newType]);
      setNewRequestTypeName('');
      setNewRequestTypeDescription('');
      setNewRequestTypeHasConfidential(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(requestTypes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRequestTypes(items);
    if (churchId) {
      api.reorderRequestTypes(churchId, items.map(item => item.id));
    }
  };

  const handleStatusChange = (id: string, status: 'active' | 'archived') => {
    if (churchId) {
      api.updateRequestTypeStatus(churchId, id, status);
      setRequestTypes(requestTypes.map(rt => rt.id === id ? { ...rt, status } : rt));
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Optional Fields</CardTitle>
          <CardDescription>
            Configure which optional fields are available for member profiles in your church.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {optionalFields.map(field => (
              <div key={field.id} className="flex items-center gap-3">
                <Checkbox
                  id={field.id}
                  checked={!!enabledFields[field.id]}
                  onCheckedChange={() => handleFieldToggle(field.id)}
                />
                <label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-border pt-6 mt-6">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Form Settings</CardTitle>
          <CardDescription>
            Manage the types of requests members can submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Request Type</h3>
            <div className="space-y-2">
              <Label htmlFor="new-request-type-name">Name</Label>
              <Input
                id="new-request-type-name"
                value={newRequestTypeName}
                onChange={(e) => setNewRequestTypeName(e.target.value)}
                placeholder="e.g., Counseling Request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-request-type-description">Description</Label>
              <Input
                id="new-request-type-description"
                value={newRequestTypeDescription}
                onChange={(e) => setNewRequestTypeDescription(e.target.value)}
                placeholder="A short description for the member form"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-request-type-confidential"
                checked={newRequestTypeHasConfidential}
                onCheckedChange={(checked) => setNewRequestTypeHasConfidential(!!checked)}
              />
              <Label htmlFor="new-request-type-confidential">Include confidential option</Label>
            </div>
            <Button onClick={handleCreateRequestType}>Create Type</Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Manage Existing Types</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="requestTypes">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {requestTypes.map((type, index) => (
                      <Draggable key={type.id} draggableId={type.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-2 my-2 border rounded"
                          >
                            <span>{type.name}</span>
                            <Checkbox
                              checked={type.status === 'active'}
                              onCheckedChange={(checked) => handleStatusChange(type.id, checked ? 'active' : 'archived')}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
