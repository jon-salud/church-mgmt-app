import React from 'react';
import Modal from '../ui/Modal';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  // ...other props
};

export default function OnboardingModal({ isOpen, onClose, children }: OnboardingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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