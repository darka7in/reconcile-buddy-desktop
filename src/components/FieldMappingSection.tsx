
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, HelpCircle, Link2, Plus, Trash2 } from 'lucide-react';
import { FileData, FieldMapping } from '@/pages/Index';
import { FIELD_SYNONYMS, getFieldTypeColor } from '@/utils/fieldRecognition';

interface FieldMappingSectionProps {
  fileA: FileData | null;
  fileB: FileData | null;
  mappings: FieldMapping[];
  setMappings: (mappings: FieldMapping[]) => void;
  onMappingComplete: () => void;
}

export const FieldMappingSection: React.FC<FieldMappingSectionProps> = ({
  fileA,
  fileB,
  mappings,
  setMappings,
  onMappingComplete
}) => {
  const [newMapping, setNewMapping] = useState<Partial<FieldMapping>>({});

  const fieldTypes = Object.keys(FIELD_SYNONYMS);

  const addMapping = () => {
    if (newMapping.fileA && newMapping.fileB && newMapping.fieldType) {
      const mapping: FieldMapping = {
        fileA: newMapping.fileA,
        fileB: newMapping.fileB,
        fieldType: newMapping.fieldType,
        isReference: newMapping.isReference || false
      };
      
      setMappings([...mappings, mapping]);
      setNewMapping({});
    }
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const toggleReference = (index: number) => {
    const updated = [...mappings];
    updated[index].isReference = !updated[index].isReference;
    setMappings(updated);
  };

  const hasReferenceField = mappings.some(m => m.isReference);

  if (!fileA || !fileB) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-8">
        Please upload both files first
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Auto-suggested mappings */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Auto-Suggested Field Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(fileA.recognizedFields).map(([headerA, fieldType]) => {
                const matchingHeaderB = Object.entries(fileB.recognizedFields).find(
                  ([, typeB]) => typeB === fieldType
                )?.[0];
                
                if (matchingHeaderB) {
                  return (
                    <div key={`${headerA}-${matchingHeaderB}`} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-4">
                        <Badge className={getFieldTypeColor(fieldType)}>
                          {fieldType}
                        </Badge>
                        <span className="text-sm font-medium">{headerA}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{matchingHeaderB}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const exists = mappings.find(m => m.fileA === headerA && m.fileB === matchingHeaderB);
                          if (!exists) {
                            setMappings([...mappings, {
                              fileA: headerA,
                              fileB: matchingHeaderB,
                              fieldType: fieldType,
                              isReference: fieldType === 'Invoice Number'
                            }]);
                          }
                        }}
                        disabled={mappings.find(m => m.fileA === headerA && m.fileB === matchingHeaderB) !== undefined}
                      >
                        {mappings.find(m => m.fileA === headerA && m.fileB === matchingHeaderB) ? 'Added' : 'Add Mapping'}
                      </Button>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual mapping creation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Custom Field Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="fileA-select">File A Field</Label>
                <Select 
                  value={newMapping.fileA} 
                  onValueChange={(value) => setNewMapping({...newMapping, fileA: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field from File A" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileA.headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fileB-select">File B Field</Label>
                <Select 
                  value={newMapping.fileB} 
                  onValueChange={(value) => setNewMapping({...newMapping, fileB: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field from File B" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileB.headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fieldType-select">Field Type</Label>
                <Select 
                  value={newMapping.fieldType} 
                  onValueChange={(value) => setNewMapping({...newMapping, fieldType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={addMapping}
                disabled={!newMapping.fileA || !newMapping.fileB || !newMapping.fieldType}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Mapping
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current mappings */}
        {mappings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Field Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className={getFieldTypeColor(mapping.fieldType)}>
                        {mapping.fieldType}
                      </Badge>
                      <span className="text-sm font-medium">{mapping.fileA}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{mapping.fileB}</span>
                      {mapping.isReference && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Reference Key
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={mapping.isReference}
                          onCheckedChange={() => toggleReference(index)}
                          id={`reference-${index}`}
                        />
                        <Label htmlFor={`reference-${index}`} className="text-sm">
                          Reference Field
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reference fields are used to match rows between files</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMapping(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {mappings.length > 0 && (
          <div className="text-center">
            {!hasReferenceField && (
              <p className="text-amber-600 dark:text-amber-400 mb-4 text-sm">
                ⚠️ Please select at least one reference field to match rows between files
              </p>
            )}
            <Button 
              onClick={onMappingComplete}
              disabled={!hasReferenceField}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Configure Tolerances
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
