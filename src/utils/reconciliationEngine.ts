
import { FileData, FieldMapping, ToleranceConfig } from '@/pages/Index';

export interface ReconciliationResult {
  status: 'matched' | 'mismatched' | 'missing_in_a' | 'missing_in_b' | 'duplicate';
  referenceKey: string;
  reason: string;
  dataA?: Record<string, any>;
  dataB?: Record<string, any>;
}

export const runReconciliation = (
  fileA: FileData,
  fileB: FileData,
  mappings: FieldMapping[],
  tolerances: ToleranceConfig[]
): ReconciliationResult[] => {
  const results: ReconciliationResult[] = [];
  const referenceMapping = mappings.find(m => m.isReference);
  
  if (!referenceMapping) {
    return results;
  }

  // Create lookup maps
  const fileAMap = new Map<string, Record<string, any>>();
  const fileBMap = new Map<string, Record<string, any>>();
  
  fileA.data.forEach(row => {
    const key = String(row[referenceMapping.fileA] || '').trim();
    if (key) {
      if (fileAMap.has(key)) {
        // Duplicate in file A
        results.push({
          status: 'duplicate',
          referenceKey: key,
          reason: 'Duplicate entry found in File A',
          dataA: row
        });
      } else {
        fileAMap.set(key, row);
      }
    }
  });

  fileB.data.forEach(row => {
    const key = String(row[referenceMapping.fileB] || '').trim();
    if (key) {
      if (fileBMap.has(key)) {
        // Duplicate in file B
        results.push({
          status: 'duplicate',
          referenceKey: key,
          reason: 'Duplicate entry found in File B',
          dataB: row
        });
      } else {
        fileBMap.set(key, row);
      }
    }
  });

  // Find matches and mismatches
  const processedKeys = new Set<string>();
  
  fileAMap.forEach((dataA, key) => {
    processedKeys.add(key);
    const dataB = fileBMap.get(key);
    
    if (!dataB) {
      results.push({
        status: 'missing_in_b',
        referenceKey: key,
        reason: 'Record exists in File A but missing in File B',
        dataA
      });
      return;
    }

    // Compare fields based on mappings and tolerances
    const mismatches: string[] = [];
    
    mappings.forEach(mapping => {
      if (mapping.isReference) return; // Skip reference field comparison
      
      const valueA = dataA[mapping.fileA];
      const valueB = dataB[mapping.fileB];
      const tolerance = tolerances.find(t => t.fieldType === mapping.fieldType);
      
      if (!areValuesEqual(valueA, valueB, mapping.fieldType, tolerance)) {
        mismatches.push(generateMismatchReason(mapping.fieldType, valueA, valueB, tolerance));
      }
    });

    if (mismatches.length === 0) {
      results.push({
        status: 'matched',
        referenceKey: key,
        reason: 'All fields match within tolerance',
        dataA,
        dataB
      });
    } else {
      results.push({
        status: 'mismatched',
        referenceKey: key,
        reason: mismatches.join('; '),
        dataA,
        dataB
      });
    }
  });

  // Find records missing in A
  fileBMap.forEach((dataB, key) => {
    if (!processedKeys.has(key)) {
      results.push({
        status: 'missing_in_a',
        referenceKey: key,
        reason: 'Record exists in File B but missing in File A',
        dataB
      });
    }
  });

  return results;
};

const areValuesEqual = (
  valueA: any,
  valueB: any,
  fieldType: string,
  tolerance?: ToleranceConfig
): boolean => {
  // Handle null/undefined/empty values
  if (!valueA && !valueB) return true;
  if (!valueA || !valueB) return false;

  // For non-numeric/date fields, do exact comparison
  if (!tolerance) {
    return String(valueA).trim().toLowerCase() === String(valueB).trim().toLowerCase();
  }

  if (fieldType === 'Date') {
    const dateA = new Date(valueA);
    const dateB = new Date(valueB);
    
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return String(valueA).trim() === String(valueB).trim();
    }
    
    const diffDays = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= tolerance.value;
  }

  // Numeric comparison
  const numA = parseFloat(String(valueA).replace(/[^0-9.-]/g, ''));
  const numB = parseFloat(String(valueB).replace(/[^0-9.-]/g, ''));
  
  if (isNaN(numA) || isNaN(numB)) {
    return String(valueA).trim() === String(valueB).trim();
  }

  if (tolerance.toleranceType === 'percentage') {
    const diff = Math.abs(numA - numB);
    const avg = (Math.abs(numA) + Math.abs(numB)) / 2;
    return avg === 0 ? diff === 0 : (diff / avg) * 100 <= tolerance.value;
  } else {
    return Math.abs(numA - numB) <= tolerance.value;
  }
};

const generateMismatchReason = (
  fieldType: string,
  valueA: any,
  valueB: any,
  tolerance?: ToleranceConfig
): string => {
  if (fieldType === 'Date' && tolerance) {
    const dateA = new Date(valueA);
    const dateB = new Date(valueB);
    
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      const diffDays = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
      return `${fieldType} differs by ${diffDays.toFixed(1)} days (${valueA} vs ${valueB})`;
    }
  }

  if (['Amount', 'Tax', 'Quantity'].includes(fieldType) && tolerance) {
    const numA = parseFloat(String(valueA).replace(/[^0-9.-]/g, ''));
    const numB = parseFloat(String(valueB).replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(numA) && !isNaN(numB)) {
      const diff = Math.abs(numA - numB);
      if (tolerance.toleranceType === 'percentage') {
        const avg = (Math.abs(numA) + Math.abs(numB)) / 2;
        const percentage = avg === 0 ? 0 : (diff / avg) * 100;
        return `${fieldType} differs by ${percentage.toFixed(2)}% (${valueA} vs ${valueB})`;
      } else {
        return `${fieldType} differs by ${diff.toFixed(2)} (${valueA} vs ${valueB})`;
      }
    }
  }

  return `${fieldType} differs (${valueA} vs ${valueB})`;
};
