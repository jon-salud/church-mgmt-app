'use client';

import { useState, useEffect } from 'react';
import { Modal, ConfirmDialog } from '@/components/ui-flowbite/modal';
import { Button } from '@/components/ui-flowbite/button';
import { Label } from '@/components/ui-flowbite/label';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { updateMemberAction } from '@/app/actions';
import { toast } from '@/lib/toast';

type Member = {
  id: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  status?: string;
  notes?: string;
  roles?: Array<{ role: string; roleId: string }>;
};

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function EditMemberModal({ isOpen, onClose, member, onSuccess }: EditMemberModalProps) {
  const [confirm, confirmState] = useConfirm();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens with member data
  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        firstName: member.profile?.firstName || '',
        lastName: member.profile?.lastName || '',
        email: member.profile?.email || '',
        phone: member.profile?.phone || '',
        address: member.profile?.address || '',
        status: member.status || 'active',
        notes: member.notes || '',
      });
      setErrors({});
    }
  }, [isOpen, member]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !member) return;

    const confirmed = await confirm({
      title: 'Save Changes',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
      variant: 'info',
    });

    if (!confirmed) return;

    setIsSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('userId', member.id);
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('address', formData.address);
      formDataObj.append('status', formData.status);
      formDataObj.append('notes', formData.notes);

      await updateMemberAction(formDataObj);

      toast.success('Member updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error('Failed to update member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form and close
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  if (!member) return null;

  return (
    <>
      <Modal open={isOpen} onClose={handleCancel} title="Edit Member">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* First Name */}
          <div>
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              className={`w-full rounded-md border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
              disabled={isSaving}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              className={`w-full rounded-md border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
              disabled={isSaving}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className={`w-full rounded-md border ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
              disabled={isSaving}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSaving}
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSaving}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSaving}
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSaving}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmState.isOpen}
        onClose={confirmState.onCancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title || ''}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant === 'info' ? 'default' : confirmState.variant || 'default'}
      />
    </>
  );
}
