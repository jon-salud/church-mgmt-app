'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui-flowbite/modal';
import { OnboardingWizard } from '@/app/onboarding/onboarding-wizard';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  churchId: string;
  initialSettings: Record<string, unknown>;
}

export function OnboardingModal({
  isOpen,
  onClose = () => {},
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
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Church Setup Wizard"
      data-testid="onboarding-modal"
    >
      <div className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <OnboardingWizard
          churchId={churchId}
          initialSettings={settings}
          onComplete={handleComplete}
          isModal={true}
        />
      </div>
    </Modal>
  );
}
