'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface BrandingStepProps {
  settings: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

export function BrandingStep({ settings, onUpdate }: BrandingStepProps) {
  const [logoUrl, setLogoUrl] = useState((settings.logoUrl as string) || '');
  const [brandColor, setBrandColor] = useState((settings.brandColor as string) || '#3b82f6');

  const handleSave = () => {
    onUpdate({ logoUrl, brandColor });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Church Logo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-2xl text-gray-500">🏛️</span>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Church Logo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your church logo to personalize the experience
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="logo-url">Logo URL (optional)</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="brand-color">Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                className="w-12 h-10 rounded border"
                title="Choose brand color"
              />
              <Input
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleSave} className="w-full max-w-xs">
              Save Branding
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
