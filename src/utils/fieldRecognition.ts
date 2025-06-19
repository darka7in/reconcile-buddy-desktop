
export const FIELD_SYNONYMS: Record<string, string[]> = {
  'Invoice Number': [
    'invoice_no', 'inv_no', 'invoice_number', 'inv_number', 'bill_no', 'bill_number',
    'invoice id', 'inv id', 'document_no', 'doc_no', 'reference', 'ref_no'
  ],
  'Date': [
    'date', 'invoice_date', 'inv_date', 'transaction_date', 'txn_date', 'posted_date',
    'created_date', 'due_date', 'issue_date', 'billing_date'
  ],
  'Amount': [
    'amount', 'total', 'total_amount', 'invoice_amount', 'inv_amount', 'net_amount',
    'gross_amount', 'subtotal', 'value', 'price', 'cost'
  ],
  'Tax': [
    'tax', 'vat', 'tax_amount', 'vat_amount', 'sales_tax', 'gst', 'tax_value'
  ],
  'Quantity': [
    'quantity', 'qty', 'units', 'count', 'number_of_items', 'items'
  ],
  'Description': [
    'description', 'desc', 'item_description', 'product_description', 'details',
    'item_name', 'product_name', 'service_description'
  ],
  'Supplier': [
    'supplier', 'vendor', 'supplier_name', 'vendor_name', 'company', 'company_name'
  ],
  'Customer': [
    'customer', 'client', 'customer_name', 'client_name', 'buyer'
  ]
};

export const recognizeCommonFields = (headers: string[]): Record<string, string> => {
  const recognized: Record<string, string> = {};
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    for (const [fieldType, synonyms] of Object.entries(FIELD_SYNONYMS)) {
      if (synonyms.some(synonym => 
        normalizedHeader.includes(synonym) || 
        synonym.includes(normalizedHeader)
      )) {
        recognized[header] = fieldType;
        break;
      }
    }
  });
  
  return recognized;
};

export const getFieldTypeColor = (fieldType: string): string => {
  const colorMap: Record<string, string> = {
    'Invoice Number': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Date': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Amount': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Tax': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Quantity': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Description': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Supplier': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Customer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  };
  
  return colorMap[fieldType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};
