import React, { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';

type BrandingSettings = {
  name?: string;
  logoUrl?: string;
  // ...other branding fields
};

type BrandingStepProps = {
  settings: BrandingSettings;
  onUpdate?: (settings: BrandingSettings) => void | Promise<void>;
  onGetStarted?: () => void;
};

export function BrandingStep({ settings, onUpdate, onGetStarted }: BrandingStepProps) {
  const [local, setLocal] = useState<BrandingSettings>(settings || {});

  async function handleSave() {
    const updated = { ...local };
    // Support both sync and async onUpdate handlers:
    const result = onUpdate?.(updated);
    if (result && result instanceof Promise) {
      await result;
    }
  }

  return (
    <div className="space-y-6">
      {/* Branding inputs */}
      <div>
        <label htmlFor="church-name" className="block text-sm font-medium text-gray-700">
          Church name
        </label>
        <input
          id="church-name"
          value={local.name || ''}
          onChange={e => setLocal({ ...local, name: e.target.value })}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      {/* Single clear primary action: Save & Get Started */}
      <div className="flex justify-center">
        <Button
          onClick={async () => {
            await handleSave();
            onGetStarted?.();
          }}
          className="w-full max-w-xs px-8 py-3 text-lg font-semibold"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

export default BrandingStep;
