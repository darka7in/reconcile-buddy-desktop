
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, HelpCircle, Settings } from 'lucide-react';
import { FieldMapping, ToleranceConfig } from '@/pages/Index';
import { getFieldTypeColor } from '@/utils/fieldRecognition';

interface ToleranceConfigSectionProps {
  mappings: FieldMapping[];
  tolerances: ToleranceConfig[];
  setTolerances: (tolerances: ToleranceConfig[]) => void;
  onToleranceComplete: () => void;
}

export const ToleranceConfigSection: React.FC<ToleranceConfigSectionProps> = ({
  mappings,
  tolerances,
  setTolerances,
  onToleranceComplete
}) => {
  useEffect(() => {
    // Initialize tolerances for numeric and date fields
    const numericDateFields = mappings.filter(m => 
      ['Amount', 'Tax', 'Quantity', 'Date'].includes(m.fieldType)
    );
    
    const initialTolerances = numericDateFields.map(mapping => {
      const existing = tolerances.find(t => t.fieldType === mapping.fieldType);
      if (existing) return existing;
      
      return {
        fieldType: mapping.fieldType,
        toleranceType: mapping.fieldType === 'Date' ? 'days' as const : 'absolute' as const,
        value: mapping.fieldType === 'Date' ? 1 : (mapping.fieldType === 'Amount' || mapping.fieldType === 'Tax' ? 0.01 : 1)
      };
    });
    
    setTolerances(initialTolerances);
  }, [mappings]);

  const updateTolerance = (fieldType: string, toleranceType: 'absolute' | 'percentage' | 'days', value: number) => {
    const updated = tolerances.map(t => 
      t.fieldType === fieldType 
        ? { ...t, toleranceType, value }
        : t
    );
    setTolerances(updated);
  };

  const getToleranceUnit = (toleranceType: string, fieldType: string) => {
    switch (toleranceType) {
      case 'percentage': return '%';
      case 'days': return 'days';
      case 'absolute': 
        if (fieldType === 'Amount' || fieldType === 'Tax') return '£';
        return 'units';
      default: return '';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              Tolerance Configuration
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set acceptable differences for numeric and date comparisons</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {tolerances.map((tolerance, index) => {
                const mapping = mappings.find(m => m.fieldType === tolerance.fieldType);
                if (!mapping) return null;
                
                return (
                  <div key={tolerance.fieldType} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={getFieldTypeColor(tolerance.fieldType)}>
                        {tolerance.fieldType}
                      </Badge>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {mapping.fileA} ↔ {mapping.fileB}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                      <div>
                        <Label htmlFor={`tolerance-type-${index}`}>Tolerance Type</Label>
                        <Select
                          value={tolerance.toleranceType}
                          onValueChange={(value: 'absolute' | 'percentage' | 'days') => 
                            updateTolerance(tolerance.fieldType, value, tolerance.value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tolerance.fieldType === 'Date' ? (
                              <SelectItem value="days">Days</SelectItem>
                            ) : (
                              <>
                                <SelectItem value="absolute">Absolute</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`tolerance-value-${index}`}>
                          Tolerance Value ({getToleranceUnit(tolerance.toleranceType, tolerance.fieldType)})
                        </Label>
                        <Input
                          id={`tolerance-value-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={tolerance.value}
                          onChange={(e) => 
                            updateTolerance(tolerance.fieldType, tolerance.toleranceType, parseFloat(e.target.value) || 0)
                          }
                          placeholder="Enter tolerance value"
                        />
                      </div>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <strong>Example:</strong> Values within ±{tolerance.value} {getToleranceUnit(tolerance.toleranceType, tolerance.fieldType)} will be considered matching
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {tolerances.length > 0 && (
          <div className="text-center">
            <Button 
              onClick={onToleranceComplete}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Run Reconciliation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
