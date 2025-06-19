
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { FileData } from '@/pages/Index';
import { recognizeCommonFields } from '@/utils/fieldRecognition';
import { parseFile } from '@/utils/fileParser';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadSectionProps {
  fileA: FileData | null;
  fileB: FileData | null;
  setFileA: (file: FileData | null) => void;
  setFileB: (file: FileData | null) => void;
  onFilesReady: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileA,
  fileB,
  setFileA,
  setFileB,
  onFilesReady
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File, setFileData: (data: FileData | null) => void) => {
    setError(null);
    
    try {
      console.log('Parsing file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const parsedData = await parseFile(file);
      console.log('Parsed headers:', parsedData.headers);
      console.log('First few rows:', parsedData.data.slice(0, 3));
      
      const recognizedFields = recognizeCommonFields(parsedData.headers);
      
      const fileData: FileData = {
        name: file.name,
        headers: parsedData.headers,
        data: parsedData.data,
        recognizedFields
      };
      
      setFileData(fileData);
    } catch (error) {
      console.error('Error parsing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to parse ${file.name}: ${errorMessage}`);
    }
  }, []);

  const createFileInput = (label: string, file: FileData | null, setFile: (file: FileData | null) => void) => (
    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {file ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {file.data.length} rows, {file.headers.length} columns
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  Headers: {file.headers.slice(0, 3).join(', ')}
                  {file.headers.length > 3 && '...'}
                </div>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {Object.entries(file.recognizedFields).map(([header, fieldType]) => (
                    <Badge key={header} variant="secondary" className="text-xs">
                      {fieldType}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFile(null)}
                className="mt-2"
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drop CSV file here or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported: CSV files (Excel files should be saved as CSV first)
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileUpload(selectedFile, setFile);
                  }
                }}
                className="hidden"
                id={`file-input-${label.toLowerCase().replace(' ', '-')}`}
              />
              <Button 
                variant="outline"
                onClick={() => document.getElementById(`file-input-${label.toLowerCase().replace(' ', '-')}`)?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {createFileInput('File A (Reference)', fileA, setFileA)}
        {createFileInput('File B (Compare)', fileB, setFileB)}
      </div>
      
      {fileA && fileB && (
        <div className="text-center">
          <Button 
            onClick={onFilesReady}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            Proceed to Field Mapping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
