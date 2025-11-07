'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui-flowbite/button';
import { FontSizeSelector } from './font-size-selector';
import { ThemeSelector } from './theme-selector';
import { updateUserPreferences } from '@/app/actions/preferences';

type ThemePreset = 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
type FontSizePreset = '14px' | '16px' | '18px' | '20px';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePreset;
  currentFontSize: FontSizePreset;
  currentThemeDarkMode: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  currentFontSize,
  currentThemeDarkMode,
}: SettingsModalProps) {
  // Draft state (not persisted until save)
  const [draftTheme, setDraftTheme] = useState<ThemePreset>(currentTheme);
  const [draftFontSize, setDraftFontSize] = useState<FontSizePreset>(currentFontSize);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if changes were made
  const hasChanges = draftTheme !== currentTheme || draftFontSize !== currentFontSize;

  // Reset draft state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftTheme(currentTheme);
      setDraftFontSize(currentFontSize);
      setError(null);
    }
  }, [isOpen, currentTheme, currentFontSize]);

  // Real-time preview (apply to DOM without persisting)
  useEffect(() => {
    if (isOpen) {
      document.documentElement.setAttribute('data-theme', draftTheme);
      document.documentElement.style.setProperty('--base-font-size', draftFontSize);
    }
  }, [isOpen, draftTheme, draftFontSize]);

  // Revert preview on close
  const handleClose = () => {
    if (hasChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Do you want to discard them?'
      );
      if (!shouldDiscard) return;
    }

    // Revert DOM to original values
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.style.setProperty('--base-font-size', currentFontSize);

    onClose();
  };

  // CRITICAL: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revert to original if modal unmounts unexpectedly
      if (isOpen) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.style.setProperty('--base-font-size', currentFontSize);
      }
    };
  }, [isOpen, currentTheme, currentFontSize]);

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateUserPreferences({
        themePreference: draftTheme,
        themeDarkMode: currentThemeDarkMode,
        fontSizePreference: draftFontSize,
      });

      // Success - close modal (changes already applied to DOM)
      onClose();

      // Optional: Show success toast
      // toast.success('Preferences saved!');
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
      console.error('Save preferences error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasChanges]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="settings-modal-title" className="text-lg font-semibold">
            User Preferences
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close settings">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-accent/50 border border-accent rounded-md p-3 text-sm">
            💡 Changes preview instantly. Click "Save" to keep them.
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Color Theme</label>
            <ThemeSelector value={draftTheme} onChange={setDraftTheme} />
          </div>

          {/* Font Size Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font Size</label>
            <FontSizeSelector value={draftFontSize} onChange={setDraftFontSize} />
          </div>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              ⚠️ You have unsaved changes
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );
}
