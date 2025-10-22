'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '../../components/ui/checkbox';
import { clientApi as api } from '../../lib/api.client';

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

  useEffect(() => {
    async function fetchSettings() {
      const me = await api.currentUser();
      const id = me?.user?.roles[0]?.churchId;
      if (id) {
        setChurchId(id);
        const settings = await api.getSettings(id);
        setEnabledFields(settings.optionalFields ?? {});
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Optional Fields</h1>
      <p className="mt-2 text-muted-foreground">
        Configure which optional fields are available for member profiles in your church.
      </p>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {optionalFields.map(field => (
            <div key={field.id} className="flex items-center gap-3">
              <Checkbox
                id={field.id}
                checked={enabledFields[field.id]}
                onCheckedChange={() => handleFieldToggle(field.id)}
              />
              <label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <button
            onClick={handleSaveChanges}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
