import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, Car, AlertCircle, ChevronDown, ChevronRight, Users, Search, Building2, CalendarIcon, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import { useTranslation } from 'react-i18next';
import { format, isAfter } from 'date-fns';
import 'react-calendar/dist/Calendar.css';
import ExcelImport from './ExcelImport';

interface Client {
  id: string;
  name: string;
  phone_number: string;
  bank: string;
  preferred_language: string;
}

interface Vehicle {
  id: string;
  client_id: string;
  car_plate: string;
  subscription_start: string;
  subscription_end: string;
  is_online: boolean;
}

const BANKS = [
  'SMEP Bank',
  'TAI SACCO',
  'Bank of Africa',
  'Family Bank',
  'Equity Bank',
  'Co-operative Bank',
  'Individual',
  'Caritas',
  'Unaitas',
  'Springboard',
  'Reflex Technologies'
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'form' | 'import'>('form');
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newClient, setNewClient] = useState({
    name: '',
    phone_number: '',
    bank: '',
    car_plate: '',
    preferred_language: 'en',
    subscription_start: new Date(),
    subscription_end: new Date()
  });
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedBanks, setExpandedBanks] = useState<string[]>(['Reflex Technologies']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'plate' | 'phone' | 'name'>('plate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (clientsError) throw clientsError;

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('car_plate');
      
      if (vehiclesError) throw vehiclesError;
      
      if (clientsData) setClients(clientsData);
      if (vehiclesData) setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    }
  };

  const isVehicleExpired = (vehicle: Vehicle) => {
    return isAfter(new Date(), new Date(vehicle.subscription_end));
  };

  const isVehicleOffline = (vehicle: Vehicle) => {
    return !vehicle.is_online || isVehicleExpired(vehicle);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedPlate = newClient.car_plate.replace(/([A-Z]+)(\d+)([A-Z]*)/, '$1 $2$3').toUpperCase();

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          phone_number: newClient.phone_number,
          bank: newClient.bank,
          preferred_language: newClient.preferred_language
        })
        .select()
        .single();

      if (clientError) throw clientError;

      if (clientData) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            client_id: clientData.id,
            car_plate: formattedPlate,
            subscription_start: newClient.subscription_start.toISOString().split('T')[0],
            subscription_end: newClient.subscription_end.toISOString().split('T')[0]
          });

        if (vehicleError) throw vehicleError;

        setNewClient({
          name: '',
          phone_number: '',
          bank: '',
          car_plate: '',
          preferred_language: 'en',
          subscription_start: new Date(),
          subscription_end: new Date()
        });
        
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBank = (bank: string) => {
    setExpandedBanks(prev =>
      prev.includes(bank) ? prev.filter(b => b !== bank) : [...prev, bank]
    );
  };

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev =>
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'online') return vehicle.is_online && !isVehicleExpired(vehicle);
    if (filter === 'offline') return isVehicleOffline(vehicle);
    return true;
  });

  const clientsByBank = BANKS.map(bank => ({
    name: bank,
    clients: clients
      .filter(client => client.bank === bank)
      .map(client => ({
        ...client,
        vehicles: filteredVehicles.filter(v => v.client_id === client.id)
      }))
  }));

  const searchResults = searchQuery
    ? clients.filter(client => {
        const clientVehicles = vehicles.filter(v => v.client_id === client.id);
        switch (searchType) {
          case 'plate':
            return clientVehicles.some(v => 
              v.car_plate.toLowerCase().includes(searchQuery.toLowerCase())
            );
          case 'phone':
            return client.phone_number.includes(searchQuery);
          case 'name':
            return client.name.toLowerCase().includes(searchQuery.toLowerCase());
          default:
            return false;
        }
      })
    : [];

  const getVehicleStatusColor = (vehicle: Vehicle) => {
    if (isVehicleExpired(vehicle)) return 'text-red-600';
    return vehicle.is_online ? 'text-green-600' : 'text-red-600';
  };

  const getVehicleStatusText = (vehicle: Vehicle) => {
    if (isVehicleExpired(vehicle)) return 'Expired';
    return vehicle.is_online ? 'Online' : 'Offline';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Clients
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'import'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 inline mr-2" />
              Excel Import
            </button>
          </div>
        </div>

        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client.name')}</label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client.phone')}</label>
              <input
                type="tel"
                value={newClient.phone_number}
                onChange={(e) => setNewClient({ ...newClient, phone_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client.bank')}</label>
              <select
                value={newClient.bank}
                onChange={(e) => setNewClient({ ...newClient, bank: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">{t('client.selectBank')}</option>
                {BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client.carPlate')}</label>
              <input
                type="text"
                value={newClient.car_plate}
                onChange={(e) => setNewClient({ ...newClient, car_plate: e.target.value.toUpperCase() })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="KAA 123A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client.language')}</label>
              <select
                value={newClient.preferred_language}
                onChange={(e) => setNewClient({ ...newClient, preferred_language: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">{t('client.startDate')}</label>
                <button
                  type="button"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="mt-1 w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm"
                >
                  {newClient.subscription_start.toLocaleDateString()}
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </button>
                {showStartCalendar && (
                  <div className="absolute z-10 mt-1">
                    <ReactCalendar
                      onChange={(date) => {
                        setNewClient({ ...newClient, subscription_start: date as Date });
                        setShowStartCalendar(false);
                      }}
                      value={newClient.subscription_start}
                      className="border rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">{t('client.endDate')}</label>
                <button
                  type="button"
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="mt-1 w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm"
                >
                  {newClient.subscription_end.toLocaleDateString()}
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </button>
                {showEndCalendar && (
                  <div className="absolute z-10 mt-1">
                    <ReactCalendar
                      onChange={(date) => {
                        setNewClient({ ...newClient, subscription_end: date as Date });
                        setShowEndCalendar(false);
                      }}
                      value={newClient.subscription_end}
                      className="border rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PlusCircle className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? t('dashboard.registering') : t('dashboard.register')}
            </button>
          </form>
        ) : (
          <ExcelImport />
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center text-gray-800">
            <Car className="w-6 h-6 mr-2 text-blue-600" />
            Vehicle Status
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'online'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setFilter('offline')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Offline/Expired
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'plate' | 'phone' | 'name')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="plate">Car Plate</option>
              <option value="phone">Phone</option>
              <option value="name">Name</option>
            </select>
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="mb-6 border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-2">Search Results:</h3>
              <div className="space-y-2">
                {searchResults.map(client => (
                  <div key={client.id} className="p-2 bg-white rounded-lg shadow-sm">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.phone_number}</p>
                    {vehicles
                      .filter(v => v.client_id === client.id)
                      .map(vehicle => (
                        <div key={vehicle.id} className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-blue-600">{vehicle.car_plate}</span>
                          <span className={`text-sm flex items-center ${getVehicleStatusColor(vehicle)}`}>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {getVehicleStatusText(vehicle)}
                          </span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {clientsByBank.map(({ name: bankName, clients: bankClients }) => (
            <div key={bankName} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleBank(bankName)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                  <div className="text-left">
                    <span className="font-medium text-gray-900">{bankName}</span>
                    <div className="text-sm text-gray-500">
                      {bankClients.length} client{bankClients.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {expandedBanks.includes(bankName) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedBanks.includes(bankName) && (
                <div className="divide-y">
                  {bankClients.map((client) => (
                    <div key={client.id} className="border-t">
                      <button
                        onClick={() => toggleClient(client.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-gray-600" />
                          <div className="text-left">
                            <span className="font-medium text-gray-900">{client.name}</span>
                            <div className="text-sm text-gray-500">
                              {client.vehicles.length} vehicle{client.vehicles.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        {expandedClients.includes(client.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedClients.includes(client.id) && (
                        <div className="bg-gray-50 p-4 space-y-4">
                          <div className="text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Phone:</span> {client.phone_number}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {client.vehicles.map((vehicle) => {
                              const isExpired = isVehicleExpired(vehicle);
                              return (
                                <div
                                  key={vehicle.id}
                                  className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                    isExpired ? 'border-2 border-red-300' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center">
                                        <Car className="w-5 h-5 mr-2 text-gray-500" />
                                        <span className="font-medium text-gray-900">{vehicle.car_plate}</span>
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1">
                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                        Expires: {new Date(vehicle.subscription_end).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className={`flex items-center ${getVehicleStatusColor(vehicle)}`}>
                                      {isExpired ? (
                                        <AlertTriangle className="w-5 h-5 mr-1" />
                                      ) : (
                                        <AlertCircle className="w-5 h-5 mr-1" />
                                      )}
                                      {getVehicleStatusText(vehicle)}
                                    </div>
                                  </div>
                                  {isExpired && (
                                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600 flex items-center">
                                      <AlertTriangle className="w-4 h-4 mr-1" />
                                      Subscription expired on {format(new Date(vehicle.subscription_end), 'PPP')}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}