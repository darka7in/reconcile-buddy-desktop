
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, BarChart3, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { FileData, FieldMapping, ToleranceConfig } from '@/pages/Index';
import { runReconciliation, ReconciliationResult } from '@/utils/reconciliationEngine';

interface ReconciliationResultsProps {
  fileA: FileData | null;
  fileB: FileData | null;
  mappings: FieldMapping[];
  tolerances: ToleranceConfig[];
  results: ReconciliationResult[];
  setResults: (results: ReconciliationResult[]) => void;
}

export const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({
  fileA,
  fileB,
  mappings,
  tolerances,
  results,
  setResults
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fileA && fileB && mappings.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        const reconciliationResults = runReconciliation(fileA, fileB, mappings, tolerances);
        setResults(reconciliationResults);
        setIsLoading(false);
      }, 1000); // Simulate processing time
    }
  }, [fileA, fileB, mappings, tolerances]);

  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      Object.values(result.dataA || {}).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      Object.values(result.dataB || {}).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      result.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    matched: results.filter(r => r.status === 'matched').length,
    mismatched: results.filter(r => r.status === 'mismatched').length,
    missingA: results.filter(r => r.status === 'missing_in_a').length,
    missingB: results.filter(r => r.status === 'missing_in_b').length,
    duplicates: results.filter(r => r.status === 'duplicate').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Matched</Badge>;
      case 'mismatched':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Mismatched</Badge>;
      case 'missing_in_a':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />Missing in A</Badge>;
      case 'missing_in_b':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Missing in B</Badge>;
      case 'duplicate':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><Eye className="w-3 h-3 mr-1" />Duplicate</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Status', 'Reference Key', 'Reason', ...mappings.map(m => `${m.fileA} (A)`), ...mappings.map(m => `${m.fileB} (B)`)];
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.status,
        result.referenceKey,
        `"${result.reason}"`,
        ...mappings.map(m => result.dataA?.[m.fileA] || ''),
        ...mappings.map(m => result.dataB?.[m.fileB] || '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reconciliation_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!fileA || !fileB || mappings.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-8">
        Please complete the previous steps to run reconciliation
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Running reconciliation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.matched}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Matched</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.mismatched}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Mismatched</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{statusCounts.missingA}</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Missing in A</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.missingB}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Missing in B</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statusCounts.duplicates}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Duplicates</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Reconciliation Results ({filteredResults.length} of {results.length})
            </span>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="mismatched">Mismatched</SelectItem>
                <SelectItem value="missing_in_a">Missing in A</SelectItem>
                <SelectItem value="missing_in_b">Missing in B</SelectItem>
                <SelectItem value="duplicate">Duplicates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference Key</TableHead>
                  <TableHead>Reason</TableHead>
                  {mappings.map(mapping => (
                    <TableHead key={`${mapping.fileA}-header`}>
                      {mapping.fileA} (A)
                    </TableHead>
                  ))}
                  {mappings.map(mapping => (
                    <TableHead key={`${mapping.fileB}-header`}>
                      {mapping.fileB} (B)
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.slice(0, 50).map((result, index) => (
                  <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell className="font-mono text-sm">{result.referenceKey}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate" title={result.reason}>
                        {result.reason}
                      </div>
                    </TableCell>
                    {mappings.map(mapping => (
                      <TableCell key={`${mapping.fileA}-${index}`} className="text-sm">
                        {result.dataA?.[mapping.fileA] || '-'}
                      </TableCell>
                    ))}
                    {mappings.map(mapping => (
                      <TableCell key={`${mapping.fileB}-${index}`} className="text-sm">
                        {result.dataB?.[mapping.fileB] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredResults.length > 50 && (
            <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
              Showing first 50 results. Export for complete data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
