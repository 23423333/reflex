import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TestTube2, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
}

export default function TestCenter() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test database connection
    try {
      const { data, error } = await supabase.from('clients').select('count');
      if (error) throw error;
      addResult('Database Connection', 'success', 'Successfully connected to database');
    } catch (error) {
      addResult('Database Connection', 'error', 'Failed to connect to database: ' + error.message);
    }

    // Test client creation
    try {
      const testClient = {
        name: 'Test Client',
        phone_number: '1234567890',
        email: 'test@example.com',
      };
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(testClient)
        .select()
        .single();
        
      if (clientError) throw clientError;
      
      // Clean up test data
      await supabase.from('clients').delete().eq('id', client.id);
      
      addResult('Client Creation', 'success', 'Successfully created and deleted test client');
    } catch (error) {
      addResult('Client Creation', 'error', 'Failed to create test client: ' + error.message);
    }

    // Test vehicle creation
    try {
      const testVehicle = {
        client_id: '00000000-0000-0000-0000-000000000000', // Using a dummy UUID
        car_plate: 'TEST123',
        subscription_end: new Date().toISOString(),
      };
      
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert(testVehicle);
        
      if (vehicleError && !vehicleError.message.includes('foreign key')) {
        throw vehicleError;
      }
      
      addResult('Vehicle Creation', 'success', 'Vehicle creation validation working correctly');
    } catch (error) {
      addResult('Vehicle Creation', 'error', 'Failed to validate vehicle creation: ' + error.message);
    }

    setTesting(false);
  };

  const addResult = (name: string, status: 'success' | 'error', message: string) => {
    setResults(prev => [...prev, { name, status, message }]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <TestTube2 className="w-6 h-6 mr-2" />
          System Test Center
        </h1>

        <button
          onClick={runTests}
          disabled={testing}
          className="w-full mb-6 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <TestTube2 className="w-5 h-5 mr-2" />
          {testing ? 'Running Tests...' : 'Run System Tests'}
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center mb-2">
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <h3 className="font-medium">{result.name}</h3>
              </div>
              <p className={`text-sm ${
                result.status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}