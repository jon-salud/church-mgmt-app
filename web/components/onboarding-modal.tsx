'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OnboardingWizard } from '@/app/onboarding/onboarding-wizard';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchId: string;
  initialSettings: Record<string, unknown>;
}

export function OnboardingModal({
  isOpen,
  onClose,
  churchId,
  initialSettings,
}: OnboardingModalProps) {
  const [settings, setSettings] = useState(initialSettings);

  // Reset settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  const handleComplete = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-testid="onboarding-modal"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Church Setup Wizard</DialogTitle>
        </DialogHeader>
        <OnboardingWizard
          churchId={churchId}
          initialSettings={settings}
          onComplete={handleComplete}
          isModal={true}
        />
      </DialogContent>
    </Dialog>
  );
}
