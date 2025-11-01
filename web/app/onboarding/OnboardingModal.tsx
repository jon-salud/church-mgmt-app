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
    <Modal open={isOpen} onClose={onClose} title={title}>
      {/* Added stable test id for E2E tests */}
      <div
        data-testid="onboarding-modal"
        role="dialog"
        aria-modal="true"
        className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg"
      >
        {children}
      </div>
    </Modal>
  );
}
