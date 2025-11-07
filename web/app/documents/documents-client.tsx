'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui-flowbite/modal';
import { Button } from '@/components/ui-flowbite/button';
import { Input } from '@/components/ui-flowbite/input';
import { Label } from '@/components/ui-flowbite/label';
import { Textarea } from '@/components/ui-flowbite/textarea';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { DownloadIcon, FileIcon, PencilIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { clientApi } from '../../lib/api.client';

// Declare browser globals for ESLint
declare const alert: (message: string) => void;
declare const confirm: (message: string) => boolean;

type DocumentsClientProps = {
  documents: Array<any>;
  roles: Array<any>;
  me: any;
};

type DocumentDraft = {
  id?: string;
  title: string;
  description?: string;
  roleIds: string[];
  file?: any;
};

export function DocumentsClient({ documents: initialDocuments, roles, me }: DocumentsClientProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [documentDraft, setDocumentDraft] = useState<DocumentDraft>({
    title: '',
    description: '',
    roleIds: [],
  });
  const [uploadProgress, setUploadProgress] = useState(false);

  const isAdmin = me?.user?.roles?.some((role: any) => role.slug === 'admin') ?? false;

  const handleUploadClick = () => {
    setDocumentDraft({ title: '', description: '', roleIds: [] });
    setIsUploadOpen(true);
  };

  const handleEditClick = (doc: any) => {
    setDocumentDraft({
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      roleIds: doc.permissions || [],
    });
    setEditingDoc(doc);
    setIsUploadOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadProgress(true);

    try {
      if (editingDoc) {
        // Update existing document
        const result: any = await clientApi.updateDocument(editingDoc.id, {
          title: documentDraft.title,
          description: documentDraft.description,
          roleIds: documentDraft.roleIds,
        });
        setDocuments(docs => docs.map(d => (d.id === result.id ? result : d)));
      } else {
        // Upload new document
        if (!documentDraft.file) {
          alert('Please select a file to upload');
          return;
        }

        const result: any = await clientApi.uploadDocument(documentDraft.file, {
          title: documentDraft.title,
          description: documentDraft.description,
          roleIds: documentDraft.roleIds,
        });
        setDocuments([...documents, result]);
      }

      setIsUploadOpen(false);
      setEditingDoc(null);
      setDocumentDraft({ title: '', description: '', roleIds: [] });
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const { url } = await clientApi.getDocumentDownloadUrl(docId);
      // Trigger download
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to archive this document?')) {
      return;
    }

    try {
      await clientApi.deleteDocument(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const toggleRolePermission = (roleId: string) => {
    setDocumentDraft(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-1">Document Library</h1>
        {isAdmin && (
          <Button onClick={handleUploadClick} data-testid="upload-document-button">
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? 'Get started by uploading a document.'
              : 'No documents are available for your role.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="border border-border rounded-lg bg-card p-5 shadow-md hover:shadow-lg transition-shadow duration-200"
              data-testid={`document-card-${doc.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <FileIcon className="h-8 w-8 text-primary mr-2" />
                  <div>
                    <h3 className="heading-2">{doc.title}</h3>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(doc)}
                      className="text-gray-500 hover:text-gray-700"
                      data-testid={`edit-document-${doc.id}`}
                      aria-label="Edit document"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid={`delete-document-${doc.id}`}
                      aria-label="Delete document"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {doc.description && <p className="text-sm text-gray-600 mb-3">{doc.description}</p>}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Uploaded {formatDate(doc.createdAt)}</span>
                <span>{doc.fileType}</span>
              </div>

              <Button
                onClick={() => handleDownload(doc.id)}
                variant="outline"
                className="w-full"
                data-testid={`download-document-${doc.id}`}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingDoc(null);
        }}
        title={editingDoc ? 'Edit Document' : 'Upload Document'}
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {!editingDoc && (
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                required
                onChange={e => setDocumentDraft({ ...documentDraft, file: e.target.files?.[0] })}
                data-testid="document-file-input"
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={documentDraft.title}
              onChange={e => setDocumentDraft({ ...documentDraft, title: e.target.value })}
              required
              maxLength={200}
              data-testid="document-title-input"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={documentDraft.description}
              onChange={e => setDocumentDraft({ ...documentDraft, description: e.target.value })}
              maxLength={1000}
              data-testid="document-description-input"
            />
          </div>

          <div>
            <Label>Permissions (Select roles that can view this document)</Label>
            <div className="space-y-2 mt-2">
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={documentDraft.roleIds.includes(role.id)}
                    onCheckedChange={() => toggleRolePermission(role.id)}
                    data-testid={`role-checkbox-${role.slug}`}
                  />
                  <Label htmlFor={`role-${role.id}`} className="font-normal">
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadOpen(false);
                setEditingDoc(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploadProgress} data-testid="submit-document-button">
              {uploadProgress ? 'Saving...' : editingDoc ? 'Update' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
