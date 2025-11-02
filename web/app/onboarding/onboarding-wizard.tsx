'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui-flowbite/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui-flowbite/card';
import { Progress } from '@/components/ui-flowbite/progress';
import { BrandingStep } from './branding-step';
import { RolesStep } from './roles-step';
import { TeamInvitesStep } from './team-invites-step';
import { MemberImportStep } from './member-import-step';
import { clientApi as api } from '@/lib/api.client';

const STEPS = [
  {
    id: 'branding',
    title: 'Welcome & Branding',
    description: 'Set up your church logo and brand colors',
  },
  {
    id: 'roles',
    title: 'Define Roles',
    description: 'Configure roles for your church members',
  },
  {
    id: 'team',
    title: 'Invite Core Team',
    description: 'Add your key team members',
  },
  {
    id: 'members',
    title: 'Import Members',
    description: 'Bulk import your church members',
  },
];

interface OnboardingWizardProps {
  churchId: string;
  initialSettings: Record<string, unknown>;
  onComplete?: () => void;
  isModal?: boolean;
}

export function OnboardingWizard({
  churchId,
  initialSettings,
  onComplete,
  isModal = false,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      await api.updateSettings(churchId, { ...settings, onboardingComplete: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Continue anyway - we still want to close the modal/redirect
    } finally {
      setIsLoading(false);
      // Always proceed with close/redirect, even if API fails
      if (isModal && onComplete) {
        onComplete();
      } else {
        router.push('/dashboard');
      }
    }
  };

  const updateSettings = (updates: Record<string, unknown>) => {
    setSettings({ ...settings, ...updates });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BrandingStep settings={settings} onUpdate={updateSettings} onGetStarted={handleNext} />
        );
      case 1:
        return <RolesStep settings={settings} onUpdate={updateSettings} />;
      case 2:
        return (
          <TeamInvitesStep
            settings={settings}
            onUpdate={updateSettings}
            churchId={churchId}
            onSendInvites={async (invites: unknown[]) => {
              // TODO: Implement invite sending
              console.log('Sending invites:', invites);
              return Promise.resolve();
            }}
          />
        );
      case 3:
        return <MemberImportStep settings={settings} onUpdate={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Church Management</CardTitle>
          <CardDescription className="text-lg">
            Let's get your church set up in just a few steps
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{STEPS[currentStep].title}</h2>
            <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
          </div>

          {renderCurrentStep()}

          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
              Skip for now
            </Button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading
                  ? 'Completing...'
                  : currentStep === STEPS.length - 1
                    ? 'Complete Setup'
                    : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
