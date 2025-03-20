import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendSMS, scheduleSMS } from '../lib/smsService';
import { MessageSquare, Calendar, Send, Clock, Users, History, ChevronDown, ChevronRight, Check, Search, Filter, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScheduledMessage {
  id: string;
  message: string;
  schedule_date: string;
  message_type: 'holiday' | 'promotion' | 'reminder';
  status: 'scheduled' | 'sent';
  recipients: string[];
}

interface Client {
  id: string;
  name: string;
  phone_number: string;
  preferred_language: string;
}

interface GroupedClients {
  letter: string;
  clients: Client[];
}

function MessagingCenter() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'compose' | 'scheduled'>('compose');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [messageType, setMessageType] = useState<'holiday' | 'promotion' | 'reminder'>('reminder');
  const [loading, setLoading] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sendNow, setSendNow] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [messageTemplates] = useState({
    en: [
      {
        type: 'renewal',
        title: 'Subscription Renewal Reminder',
        content: 'Dear valued customer, your vehicle tracking subscription will expire soon. Renew now to maintain uninterrupted service. Contact us at 0704529999 for assistance.'
      },
      {
        type: 'promotion',
        title: 'Business Promotion',
        content: 'Experience premium vehicle tracking with Reflex Technologies! Upgrade your subscription today and get 1 month free. Limited time offer. Contact us for details.'
      },
      {
        type: 'holiday',
        title: 'Holiday Greeting',
        content: 'Wishing you a joyful holiday season! Thank you for choosing Reflex Technologies. Stay safe on the roads!'
      }
    ],
    sw: [
      {
        type: 'renewal',
        title: 'Ukumbusho wa Kuhuisha Usajili',
        content: 'Mteja wetu mpendwa, usajili wako wa kufuatilia gari utaisha hivi karibuni. Huisha sasa ili kudumisha huduma isiyokatizwa. Wasiliana nasi kupitia 0704529999 kwa usaidizi.'
      },
      {
        type: 'promotion',
        title: 'Promosheni ya Biashara',
        content: 'Pata huduma bora ya kufuatilia gari na Reflex Technologies! Huisha usajili wako leo na upate mwezi mmoja bila malipo. Ofa ya muda mfupi. Wasiliana nasi kwa maelezo zaidi.'
      },
      {
        type: 'holiday',
        title: 'Salamu za Likizo',
        content: 'Tunakutakia likizo njema! Asante kwa kuchagua Reflex Technologies. Kuwa salama barabarani!'
      }
    ],
    fr: [
      {
        type: 'renewal',
        title: 'Rappel de Renouvellement d\'Abonnement',
        content: 'Cher client, votre abonnement de suivi de véhicule expirera bientôt. Renouvelez maintenant pour maintenir un service ininterrompu. Contactez-nous au 0704529999 pour assistance.'
      },
      {
        type: 'promotion',
        title: 'Promotion Commerciale',
        content: 'Découvrez le suivi de véhicule premium avec Reflex Technologies ! Mettez à niveau votre abonnement aujourd\'hui et obtenez 1 mois gratuit. Offre limitée. Contactez-nous pour plus de détails.'
      },
      {
        type: 'holiday',
        title: 'Vœux de Vacances',
        content: 'Nous vous souhaitons de joyeuses fêtes ! Merci d\'avoir choisi Reflex Technologies. Restez prudent sur les routes !'
      }
    ],
    es: [
      {
        type: 'renewal',
        title: 'Recordatorio de Renovación de Suscripción',
        content: 'Estimado cliente, su suscripción de rastreo vehicular vencerá pronto. Renueve ahora para mantener el servicio sin interrupciones. Contáctenos al 0704529999 para asistencia.'
      },
      {
        type: 'promotion',
        title: 'Promoción Comercial',
        content: '¡Experimente el rastreo vehicular premium con Reflex Technologies! Actualice su suscripción hoy y obtenga 1 mes gratis. Oferta por tiempo limitado. Contáctenos para más detalles.'
      },
      {
        type: 'holiday',
        title: 'Saludo Festivo',
        content: '¡Le deseamos una feliz temporada festiva! Gracias por elegir Reflex Technologies. ¡Manténgase seguro en las carreteras!'
      }
    ]
  });

  useEffect(() => {
    fetchScheduledMessages();
    fetchClients();
  }, []);

  const fetchScheduledMessages = async () => {
    const { data } = await supabase
      .from('scheduled_messages')
      .select('*')
      .order('schedule_date', { ascending: false });
    if (data) setScheduledMessages(data);
  };

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (data) setClients(data);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClients.length === 0) {
      showStatus('error', 'Please select at least one recipient');
      return;
    }

    setLoading(true);
    try {
      const selectedClientData = clients.filter(client => selectedClients.includes(client.id));
      
      if (sendNow) {
        // Send messages immediately
        for (const client of selectedClientData) {
          try {
            await sendSMS({
              to: client.phone_number,
              message: message
            });
            showStatus('success', `Messages sent successfully to ${selectedClientData.length} recipients`);
          } catch (error) {
            console.error(`Failed to send SMS to ${client.phone_number}:`, error);
            showStatus('error', `Failed to send message to ${client.name}: ${error.message}`);
          }
        }
      } else {
        // Schedule messages
        await scheduleSMS(message, scheduleDate, selectedClients);
        showStatus('success', 'Messages scheduled successfully');
        fetchScheduledMessages(); // Refresh the scheduled messages list
      }

      // Clear form
      setMessage('');
      setScheduleDate('');
      setSelectedClients([]);
    } catch (error) {
      console.error('Error processing messages:', error);
      showStatus('error', `Failed to process messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (letter: string) => {
    setExpandedGroups(prev =>
      prev.includes(letter) ? prev.filter(g => g !== letter) : [...prev, letter]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const useTemplate = (content: string) => {
    setMessage(content);
  };

  // Group clients by first letter of name
  const groupedClients = clients.reduce((groups, client) => {
    const firstLetter = client.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(client);
    return groups;
  }, {} as Record<string, Client[]>);

  // Filter and sort clients
  const filteredGroups: GroupedClients[] = Object.entries(groupedClients)
    .map(([letter, groupClients]) => ({
      letter,
      clients: groupClients.filter(client =>
        searchQuery
          ? client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.phone_number.includes(searchQuery)
          : true
      )
    }))
    .filter(group => group.clients.length > 0)
    .sort((a, b) => a.letter.localeCompare(b.letter));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <MessageSquare className="w-8 h-8 mr-3" />
          Message Center
        </h1>
        <p className="text-blue-100">Manage all your client communications in one place</p>
      </div>

      <div className="bg-white rounded-b-lg shadow-xl">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'compose', label: 'Compose Message', icon: Send },
              { id: 'scheduled', label: 'Scheduled Messages', icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {statusMessage && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {statusMessage.text}
            </div>
          )}

          {activeTab === 'compose' && (
            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="holiday">Holiday Greeting</option>
                    <option value="promotion">Business Promotion</option>
                    <option value="reminder">Subscription Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={sendNow}
                        onChange={() => setSendNow(true)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Send Immediately</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!sendNow}
                        onChange={() => setSendNow(false)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Schedule for Later</span>
                    </label>
                  </div>
                </div>
              </div>

              {!sendNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Schedule Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Recipients
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clients..."
                      className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                  {filteredGroups.map(({ letter, clients: groupClients }) => (
                    <div key={letter} className="p-2">
                      <button
                        type="button"
                        onClick={() => toggleGroup(letter)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <span className="font-medium">{letter}</span>
                        {expandedGroups.includes(letter) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedGroups.includes(letter) && (
                        <div className="ml-4 space-y-2">
                          {groupClients.map((client) => (
                            <label key={client.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={(e) => {
                                  setSelectedClients(prev =>
                                    e.target.checked
                                      ? [...prev, client.id]
                                      : prev.filter(id => id !== client.id)
                                  );
                                }}
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{client.name} - {client.phone_number}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Templates ({i18n.language.toUpperCase()})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {messageTemplates[i18n.language].map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => useTemplate(template.content)}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <h3 className="font-medium mb-2">{template.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                    </button>
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Processing...' : (sendNow ? 'Send Message' : 'Schedule Message')}
              </button>
            </form>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              {scheduledMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        msg.message_type === 'holiday' ? 'bg-green-100 text-green-800' :
                        msg.message_type === 'promotion' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {msg.message_type}
                      </span>
                      <p className="mt-2 text-gray-900">{msg.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.schedule_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {msg.recipients?.length || 0} recipients
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagingCenter;