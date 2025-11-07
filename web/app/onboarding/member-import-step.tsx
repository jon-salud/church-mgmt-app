'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-flowbite/card';
import { Upload, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { clientApi } from '@/lib/api.client';

interface ImportResult {
  success: boolean;
  count: number;
  errors?: string[];
}

interface MemberImportStepProps {
  settings: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

// Helper function to parse emails from CSV
function parseEmailsFromCSV(csvText: string): string[] {
  const emails: string[] = [];
  const lines = csvText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split by comma and check each field for email pattern
    const fields = trimmed.split(',');
    for (const field of fields) {
      const email = field.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emails.push(email);
      }
    }
  }

  return [...new Set(emails)]; // Remove duplicates
}

export function MemberImportStep({ settings: _settings, onUpdate }: MemberImportStepProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      // Parse CSV file to extract emails
      const text = await selectedFile.text();
      const emails = parseEmailsFromCSV(text);

      if (emails.length === 0) {
        setImportResult({
          success: false,
          count: 0,
          errors: ['No valid email addresses found in the file.'],
        });
        return;
      }

      const result = await clientApi.bulkImportMembers(emails);
      setImportResult({
        success: true,
        count: emails.length,
      });
      onUpdate({ memberImportResult: result });
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        count: 0,
        errors: ['Import failed. Please check your file format.'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Import Church Members
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with your existing church member data to quickly populate the system.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              title="Select CSV file for member import"
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">{(selectedFile as any).name}</p>
                    <p className="text-sm text-muted-foreground">
                      {((selectedFile as any).size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleBrowseClick} variant="outline">
                    Choose Different File
                  </Button>
                  <Button onClick={resetImport} variant="outline">
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium">Upload CSV File</p>
                  <p className="text-sm text-muted-foreground">
                    Select a CSV file containing member information
                  </p>
                </div>
                <Button onClick={handleBrowseClick} variant="outline">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* CSV Format Help */}
          <Card className="bg-muted/50 border-muted">
            <CardContent className="pt-4">
              <h4 className="font-medium text-foreground mb-2">CSV Format Requirements</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your CSV file should include these columns (name is required, others optional):
              </p>
              <div className="text-sm font-mono bg-card p-2 rounded border text-foreground">
                name,email,phone,address,city,state,zip,birth_date
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Example: John Doe,john@example.com,555-0123,123 Main St,Anytown,CA,12345,1980-01-01
              </p>
            </CardContent>
          </Card>

          {/* Import Button */}
          {selectedFile && !importResult && (
            <div className="flex justify-center">
              <Button onClick={handleImport} disabled={isImporting} className="w-full max-w-xs">
                {isImporting ? (
                  'Importing Members...'
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {selectedFile.name}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <Card
              className={
                importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}
                    >
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </h4>
                    <p
                      className={`text-sm ${importResult.success ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {importResult.success
                        ? `Successfully imported ${importResult.count} member${importResult.count !== 1 ? 's' : ''}`
                        : `Failed to import members. ${importResult.errors?.join(', ')}`}
                    </p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {!importResult.success && (
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleImport} variant="outline">
                      Try Again
                    </Button>
                    <Button onClick={resetImport} variant="outline">
                      Upload Different File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
