
export interface ParsedFileData {
  headers: string[];
  data: Record<string, any>[];
}

export const parseFile = async (file: File): Promise<ParsedFileData> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv') {
    return parseCSVFile(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcelFileAsCSV(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel files.');
  }
};

const parseCSVFile = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCSVText(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Try UTF-8 first, which handles most cases
    reader.readAsText(file, 'UTF-8');
  });
};

const parseExcelFileAsCSV = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For now, we'll ask users to save Excel as CSV
        // In a full implementation, we'd use a library like xlsx
        reject(new Error('Excel files need to be converted to CSV format first. Please save your Excel file as CSV and upload again.'));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

const parseCSVText = (text: string): ParsedFileData => {
  // Clean the text and split into lines
  const lines = text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Handle old Mac line endings
    .split('\n')
    .filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }
  
  // Parse the first line as headers
  const headers = parseCSVLine(lines[0]);
  
  if (headers.length === 0) {
    throw new Error('No headers found in file');
  }
  
  // Clean headers - remove quotes and trim whitespace
  const cleanHeaders = headers.map(header => 
    header.replace(/^["']|["']$/g, '').trim()
  ).filter(header => header.length > 0);
  
  if (cleanHeaders.length === 0) {
    throw new Error('No valid headers found in file');
  }
  
  // Parse data rows
  const dataLines = lines.slice(1);
  const data = dataLines.map((line, index) => {
    const values = parseCSVLine(line);
    const row: Record<string, any> = {};
    
    cleanHeaders.forEach((header, i) => {
      const value = values[i] || '';
      // Clean the value - remove quotes and trim
      row[header] = value.replace(/^["']|["']$/g, '').trim();
    });
    
    row._id = index; // Add unique identifier
    return row;
  });
  
  return { headers: cleanHeaders, data };
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current);
  return result;
};
