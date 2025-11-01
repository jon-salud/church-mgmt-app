import React from 'react';
import { Modal } from '@/components/ui-flowbite/modal';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  // ...other props
};

export default function OnboardingModal({
  isOpen,
  onClose,
  children,
  title = 'Onboarding',
}: OnboardingModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title={title} data-testid="onboarding-modal">
      <div className="max-w-3xl mx-auto">{children}</div>
    </Modal>
  );
}
