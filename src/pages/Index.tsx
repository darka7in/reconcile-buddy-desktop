
import React, { useState } from 'react';
import { FileUploadSection } from '@/components/FileUploadSection';
import { FieldMappingSection } from '@/components/FieldMappingSection';
import { ToleranceConfigSection } from '@/components/ToleranceConfigSection';
import { ReconciliationResults } from '@/components/ReconciliationResults';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Settings, BarChart3 } from 'lucide-react';

export interface FileData {
  name: string;
  headers: string[];
  data: Record<string, any>[];
  recognizedFields: Record<string, string>;
}

export interface FieldMapping {
  fileA: string;
  fileB: string;
  fieldType: string;
  isReference: boolean;
}

export interface ToleranceConfig {
  fieldType: string;
  toleranceType: 'absolute' | 'percentage' | 'days';
  value: number;
}

const Index = () => {
  const [fileA, setFileA] = useState<FileData | null>(null);
  const [fileB, setFileB] = useState<FileData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [tolerances, setTolerances] = useState<ToleranceConfig[]>([]);
  const [reconciliationResults, setReconciliationResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  const canProceedToMapping = fileA && fileB;
  const canProceedToTolerance = canProceedToMapping && fieldMappings.length > 0;
  const canRunReconciliation = canProceedToTolerance && tolerances.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Document Reconciliation
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Smart field recognition and automated reconciliation tool
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Upload
              {(fileA && fileB) && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="mapping" disabled={!canProceedToMapping} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Field Mapping
              {fieldMappings.length > 0 && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="tolerance" disabled={!canProceedToTolerance} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tolerances
              {tolerances.length > 0 && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!canRunReconciliation} className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  File Upload
                </CardTitle>
                <CardDescription>
                  Upload two documents (Excel, CSV, or PDF) to begin reconciliation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadSection 
                  fileA={fileA} 
                  fileB={fileB} 
                  setFileA={setFileA} 
                  setFileB={setFileB}
                  onFilesReady={() => setActiveTab('mapping')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  Field Mapping & Recognition
                </CardTitle>
                <CardDescription>
                  Map fields between documents and configure field types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldMappingSection 
                  fileA={fileA} 
                  fileB={fileB} 
                  mappings={fieldMappings}
                  setMappings={setFieldMappings}
                  onMappingComplete={() => setActiveTab('tolerance')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tolerance" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  Tolerance Configuration
                </CardTitle>
                <CardDescription>
                  Set comparison tolerances for numeric and date fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ToleranceConfigSection 
                  mappings={fieldMappings}
                  tolerances={tolerances}
                  setTolerances={setTolerances}
                  onToleranceComplete={() => setActiveTab('results')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Reconciliation Results
                </CardTitle>
                <CardDescription>
                  Review discrepancies and export your reconciliation report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationResults 
                  fileA={fileA}
                  fileB={fileB}
                  mappings={fieldMappings}
                  tolerances={tolerances}
                  results={reconciliationResults}
                  setResults={setReconciliationResults}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
