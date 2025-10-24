"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { clientApi as api } from "@/lib/api.client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequestType } from "@/lib/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const optionalFields = [
    { id: "membershipStatus", label: "Membership Status" },
    { id: "joinMethod", label: "Join Method" },
    { id: "joinDate", label: "Join Date" },
    { id: "previousChurch", label: "Previous Church" },
    { id: "baptismDate", label: "Baptism Date" },
    { id: "spiritualGifts", label: "Spiritual Gifts" },
    { id: "coursesAttended", label: "Courses Attended" },
    { id: "maritalStatus", label: "Marital Status" },
    { id: "weddingAnniversary", label: "Wedding Anniversary" },
    { id: "occupation", label: "Occupation" },
    { id: "school", label: "School" },
    { id: "gradeLevel", label: "Grade Level" },
    { id: "graduationYear", label: "Graduation Year" },
    { id: "skillsAndInterests", label: "Skills and Interests" },
    { id: "backgroundCheckStatus", label: "Background Check Status" },
    { id: "backgroundCheckDate", label: "Background Check Date" },
];

interface SettingsFormProps {
    initialRequestTypes: RequestType[];
    initialSettings: any;
    churchId: string;
}

export function SettingsForm({ initialRequestTypes, initialSettings, churchId }: SettingsFormProps) {
    // Request type management state
    const [requestTypes, setRequestTypes] = useState<RequestType[]>(initialRequestTypes || []);
    const [newRequestTypeName, setNewRequestTypeName] = useState("");
    const [newRequestTypeDescription, setNewRequestTypeDescription] = useState("");
    const [newRequestTypeHasConfidential, setNewRequestTypeHasConfidential] = useState(false);

    // Profile fields management state
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize selected fields from settings
    useEffect(() => {
        if (initialSettings?.enabledFields) {
            setSelectedFields(initialSettings.enabledFields);
        }
    }, [initialSettings]);

    // Request type handlers
    const handleCreateRequestType = async () => {
        if (!newRequestTypeName.trim()) return;

        try {
            const response = await api.updateSettings(churchId, {
                newRequestType: {
                    name: newRequestTypeName,
                    description: newRequestTypeDescription,
                    hasConfidentialField: newRequestTypeHasConfidential,
                    status: "active" as const,
                },
            });

            if (response.requestType) {
                setRequestTypes((current) => [...current, response.requestType]);
                setNewRequestTypeName("");
                setNewRequestTypeDescription("");
                setNewRequestTypeHasConfidential(false);
            }
        } catch (error) {
            console.error("Failed to create request type:", error);
        }
    };

    const handleStatusChange = async (typeId: string, newStatus: "active" | "archived") => {
        try {
            const updatedTypes = requestTypes.map((type) => (type.id === typeId ? { ...type, status: newStatus } : type));

            await api.updateSettings(churchId, {
                requestTypes: updatedTypes,
            });

            setRequestTypes(updatedTypes);
        } catch (error) {
            console.error("Failed to update request type:", error);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(requestTypes);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedTypes = items.map((type, index) => ({
            ...type,
            displayOrder: index,
        }));

        setRequestTypes(updatedTypes);

        try {
            await api.updateSettings(churchId, {
                requestTypes: updatedTypes,
            });
        } catch (error) {
            console.error("Failed to update request type order:", error);
        }
    };

    // Profile fields handlers
    const handleSaveFields = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            await api.updateSettings(churchId, {
                enabledFields: selectedFields,
            });
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">Member Profile Fields</h2>
                    <p className="text-sm text-muted-foreground">Configure which optional fields to show in member profiles</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {optionalFields.map((field) => (
                            <div key={field.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={field.id}
                                    checked={selectedFields.includes(field.id)}
                                    onCheckedChange={() => {
                                        setSelectedFields((current) => (current.includes(field.id) ? current.filter((id) => id !== field.id) : [...current, field.id]));
                                    }}
                                />
                                <Label htmlFor={field.id}>{field.label}</Label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveFields} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Request Types</CardTitle>
                    <CardDescription>Manage request types available to members</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Create New Request Type</h3>
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="new-request-type-name">Name</Label>
                                    <Input id="new-request-type-name" value={newRequestTypeName} onChange={(e) => setNewRequestTypeName(e.target.value)} placeholder="e.g., Counseling Request" />
                                </div>
                                <div>
                                    <Label htmlFor="new-request-type-description">Description</Label>
                                    <Input
                                        id="new-request-type-description"
                                        value={newRequestTypeDescription}
                                        onChange={(e) => setNewRequestTypeDescription(e.target.value)}
                                        placeholder="A short description for the member form"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="new-request-type-confidential" checked={newRequestTypeHasConfidential} onCheckedChange={(checked) => setNewRequestTypeHasConfidential(!!checked)} />
                                    <Label htmlFor="new-request-type-confidential">Include confidential option</Label>
                                </div>
                                <div>
                                    <Button onClick={handleCreateRequestType}>Create Type</Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Manage Existing Types</h3>
                            <div className="border rounded-md">
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
                                                                className="flex items-center justify-between p-4 border-b last:border-b-0"
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{type.name}</div>
                                                                    {type.description && <div className="text-sm text-muted-foreground">{type.description}</div>}
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Label htmlFor={`type-${type.id}-status`}>Active</Label>
                                                                        <Checkbox
                                                                            id={`type-${type.id}-status`}
                                                                            checked={type.status === "active"}
                                                                            onCheckedChange={(checked) => handleStatusChange(type.id, checked ? "active" : "archived")}
                                                                        />
                                                                    </div>
                                                                    <div className="text-muted-foreground">
                                                                        <span title="Drag to reorder">≡</span>
                                                                    </div>
                                                                </div>
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
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
