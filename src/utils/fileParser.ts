
export interface ParsedFileData {
  headers: string[];
  data: Record<string, any>[];
}

export const parseCSVFile = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('File is empty'));
          return;
        }
        
        // Parse CSV (simple implementation)
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataLines = lines.slice(1);
        
        const data = dataLines.map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, any> = {};
          
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          
          row._id = index; // Add unique identifier
          return row;
        });
        
        resolve({ headers, data });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
