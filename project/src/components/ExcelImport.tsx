import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { addMonths } from 'date-fns';

interface ImportResult {
  filename: string;
  bank: string;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{ row: number; error: string }>;
}

interface ImportHistoryItem {
  id: string;
  filename: string;
  bank: string;
  status: string;
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  error_log: Array<{ row: number; error: string }>;
  created_at: string;
}

export default function ExcelImport() {
  const [importing, setImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      const bankName = extractBankName(file.name);
      const data = await readExcelFile(file);
      const result = await importData(data, bankName, file.name);
      setImportResult(result);
      await fetchImportHistory();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls', '.csv']
    },
    maxFiles: 1
  });

  const extractBankName = (filename: string): string => {
    const name = filename.toLowerCase().split('_')[0].split('.')[0];
    const bankMap: { [key: string]: string } = {
      'smep': 'SMEP Bank',
      'tai': 'TAI SACCO',
      'boa': 'Bank of Africa',
      'family': 'Family Bank',
      'equity': 'Equity Bank',
      'coop': 'Co-operative Bank',
      'individual': 'Individual',
      'caritas': 'Caritas',
      'unaitas': 'Unaitas',
      'springboard': 'Springboard',
      'reflex': 'Reflex Technologies'
    };
    return bankMap[name] || 'Individual';
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const rows = jsonData.filter((row: any[]) => row.length > 0);
          if (rows.length < 2) {
            throw new Error('Excel file must contain headers and at least one data row');
          }

          // Enhanced header mapping with more variations
          const headerMap: { [key: string]: string[] } = {
            'name': ['name', 'client name', 'customer name', 'full name', 'client', 'customer'],
            'phone_number': ['phone', 'phone number', 'contact', 'mobile', 'tel', 'telephone', 'phone no', 'contact no'],
            'car_plate': ['plate', 'car plate', 'number plate', 'vehicle plate', 'registration', 'reg no', 'reg number', 'vehicle reg'],
            'installation_date': ['installation', 'install date', 'date installed', 'fitted on', 'installation date'],
            'duration': ['duration', 'period', 'months', 'subscription period', 'contract period'],
            'erg_number': ['erg', 'erg no', 'erg number', 'tracking id', 'device id', 'tracker id']
          };

          // Normalize headers
          const headers = rows[0].map((header: string) => {
            if (!header) return null;
            const normalizedHeader = header.toString().toLowerCase().trim();
            for (const [standardHeader, variations] of Object.entries(headerMap)) {
              if (variations.includes(normalizedHeader)) {
                return standardHeader;
              }
            }
            return normalizedHeader;
          });

          // Map data to standardized format
          const standardizedData = rows.slice(1).map(row => {
            const rowData: any = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                let value = row[index];

                switch (header) {
                  case 'phone_number':
                    value = value.toString().replace(/[^\d+]/g, '');
                    if (!value.startsWith('+')) {
                      value = value.startsWith('0') ? `+254${value.slice(1)}` : `+${value}`;
                    }
                    break;

                  case 'car_plate':
                    value = value.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
                    value = value.replace(/([A-Z]{3})(\d{3})([A-Z]?)/, '$1 $2$3');
                    break;

                  case 'installation_date':
                    if (typeof value === 'number') {
                      // Handle Excel date number format
                      value = new Date(Math.round((value - 25569) * 86400 * 1000));
                    } else {
                      value = new Date(value);
                    }
                    value = value.toISOString().split('T')[0];
                    break;

                  case 'duration':
                    // Convert duration to number of months
                    value = parseInt(value.toString().replace(/[^\d]/g, ''));
                    break;
                }

                rowData[header] = value;
              }
            });

            // Calculate expiry date based on installation date and duration
            if (rowData.installation_date && rowData.duration) {
              const installDate = new Date(rowData.installation_date);
              rowData.subscription_end = addMonths(installDate, rowData.duration)
                .toISOString()
                .split('T')[0];
            }

            return rowData;
          });

          resolve(standardizedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const importData = async (data: any[], bank: string, filename: string): Promise<ImportResult> => {
    const { data: importRecord, error: importError } = await supabase
      .from('import_history')
      .insert({
        filename,
        bank,
        status: 'processing',
        total_records: data.length
      })
      .select()
      .single();

    if (importError) throw importError;

    const result: ImportResult = {
      filename,
      bank,
      totalRecords: data.length,
      successfulImports: 0,
      failedImports: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      try {
        // Validate required fields
        if (!rowData.name || !rowData.phone_number || !rowData.car_plate) {
          throw new Error('Missing required fields: name, phone number, or car plate');
        }

        // Insert client
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: rowData.name,
            phone_number: rowData.phone_number,
            bank,
            import_id: importRecord.id,
            import_row_number: i + 2,
            erg_number: rowData.erg_number
          })
          .select()
          .single();

        if (clientError) throw clientError;

        // Insert vehicle with calculated dates
        const subscriptionStart = rowData.installation_date || new Date().toISOString().split('T')[0];
        const subscriptionEnd = rowData.subscription_end || 
          addMonths(new Date(subscriptionStart), rowData.duration || 12)
            .toISOString()
            .split('T')[0];

        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            client_id: client.id,
            car_plate: rowData.car_plate,
            subscription_start: subscriptionStart,
            subscription_end: subscriptionEnd
          });

        if (vehicleError) throw vehicleError;

        result.successfulImports++;
      } catch (error) {
        result.failedImports++;
        result.errors.push({
          row: i + 2,
          error: error.message
        });
      }
    }

    // Update import history
    await supabase
      .from('import_history')
      .update({
        status: result.failedImports === 0 ? 'completed' : 'completed_with_errors',
        successful_imports: result.successfulImports,
        failed_imports: result.failedImports,
        error_log: result.errors
      })
      .eq('id', importRecord.id);

    return result;
  };

  const fetchImportHistory = async () => {
    const { data } = await supabase
      .from('import_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setImportHistory(data);
    }
  };

  React.useEffect(() => {
    fetchImportHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Import Clients from Excel
        </h2>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Import Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• File name should start with the bank name (e.g., smep_clients.xlsx)</li>
            <li>• Required columns: Client Name, Phone Number, Car Plate</li>
            <li>• Optional columns: Installation Date, Duration (months), ERG Number</li>
            <li>• Phone numbers will be automatically formatted to international format (+254...)</li>
            <li>• Car plates will be automatically formatted (KAA 123A)</li>
            <li>• Expiry date is calculated from installation date and duration</li>
          </ul>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-10 h-10 mx-auto mb-4 ${
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          }`} />
          
          {isDragActive ? (
            <p className="text-blue-500">Drop the Excel file here</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag and drop an Excel file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: .xlsx, .xls, .csv
              </p>
            </div>
          )}
        </div>

        {importing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Importing data...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Import failed</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Import Results</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">File:</span> {importResult.filename}
              </p>
              <p>
                <span className="font-medium">Bank:</span> {importResult.bank}
              </p>
              <p>
                <span className="font-medium">Total Records:</span> {importResult.totalRecords}
              </p>
              <p className="text-green-600">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Successfully imported: {importResult.successfulImports}
              </p>
              {importResult.failedImports > 0 && (
                <div className="text-red-600">
                  <X className="w-4 h-4 inline mr-1" />
                  Failed imports: {importResult.failedImports}
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm">
                        Row {error.row}: {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {importHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Imports</h2>
          <div className="space-y-4">
            {importHistory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.filename}</h3>
                    <p className="text-sm text-gray-500">{item.bank}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'completed_with_errors' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Records</p>
                    <p className="font-medium">{item.total_records}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Successful</p>
                    <p className="font-medium text-green-600">{item.successful_imports}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="font-medium text-red-600">{item.failed_imports}</p>
                  </div>
                </div>
                {item.failed_imports > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">
                      View Errors
                    </summary>
                    <div className="mt-2 text-sm text-red-600 max-h-40 overflow-y-auto">
                      {item.error_log.map((error: any, index: number) => (
                        <p key={index}>Row {error.row}: {error.error}</p>
                      ))}
                    </div>
                  </details>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Imported on {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}