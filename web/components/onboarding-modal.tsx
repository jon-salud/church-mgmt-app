'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [internalOpen, setInternalOpen] = useState(isOpen);

  // Sync internal state with prop
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // Reset settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  const handleComplete = () => {
    // Close modal immediately
    setInternalOpen(false);
    onClose();
    // Navigate to dashboard to re-fetch settings with onboardingComplete=true
    // Small delay to allow modal close animation
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      router.push('/dashboard');
    }, 200);
  };

  return (
    <Modal
      open={internalOpen}
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
