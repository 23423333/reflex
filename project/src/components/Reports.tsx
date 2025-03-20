import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download, Filter, AlertTriangle } from 'lucide-react';
import { format, isAfter } from 'date-fns';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [status, setStatus] = useState<'all' | 'online' | 'offline' | 'expired'>('all');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          clients (
            name,
            phone_number,
            email,
            bank
          )
        `);

      if (dateRange.start) {
        query = query.gte('subscription_start', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('subscription_end', dateRange.end);
      }

      const { data } = await query;

      if (data) {
        // Filter data based on status
        const filteredData = data.filter(vehicle => {
          const isExpired = isAfter(new Date(), new Date(vehicle.subscription_end));
          switch (status) {
            case 'online':
              return vehicle.is_online && !isExpired;
            case 'offline':
              return !vehicle.is_online || isExpired;
            case 'expired':
              return isExpired;
            default:
              return true;
          }
        });

        const csv = generateCSV(filteredData);
        downloadCSV(csv, `vehicle-report-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data) => {
    const headers = [
      'Car Plate',
      'Client Name',
      'Bank/Institution',
      'Phone',
      'Email',
      'Status',
      'Subscription Start',
      'Subscription End',
      'Days Until Expiry',
      'Connection Status',
      'Subscription Status'
    ];

    const rows = data.map(vehicle => {
      const now = new Date();
      const endDate = new Date(vehicle.subscription_end);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = isAfter(now, endDate);

      return [
        vehicle.car_plate,
        vehicle.clients.name,
        vehicle.clients.bank,
        vehicle.clients.phone_number,
        vehicle.clients.email || 'N/A',
        isExpired ? 'EXPIRED' : (vehicle.is_online ? 'Online' : 'Offline'),
        format(new Date(vehicle.subscription_start), 'yyyy-MM-dd'),
        format(new Date(vehicle.subscription_end), 'yyyy-MM-dd'),
        isExpired ? 'EXPIRED' : daysUntilExpiry,
        vehicle.is_online ? 'Connected' : 'Disconnected',
        isExpired ? 'EXPIRED' : 'Active'
      ];
    });

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Generate Reports
        </h1>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700">
              This report includes subscription status information. Vehicles with expired subscriptions
              will be marked as offline and highlighted in the report.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Vehicle Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'all' | 'online' | 'offline' | 'expired')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline/Expired</option>
              <option value="expired">Expired Subscriptions</option>
            </select>
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-5 h-5 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}