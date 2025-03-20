import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: {
        title: 'Dashboard',
        newClient: 'Register New Client',
        vehicleStatus: 'Vehicle Status',
        search: 'Search',
        all: 'All',
        online: 'Online',
        offline: 'Offline',
        totalVehicles: 'Total Vehicles',
        activeSubscriptions: 'Active Subscriptions',
        registering: 'Registering...',
        register: 'Register Client',
        help: 'Help Center',
        reports: 'Reports',
        test: 'Test Center',
        support: 'Contact Support',
        logout: 'Logout'
      },
      client: {
        name: 'Name',
        phone: 'Phone Number',
        bank: 'Bank/Institution',
        selectBank: 'Select Bank/Institution',
        carPlate: 'Car Plate',
        subscription: 'Subscription Period',
        startDate: 'Start Date',
        endDate: 'End Date',
        language: 'Preferred Language'
      },
      messages: {
        compose: 'Message Center',
        schedule: 'Schedule Message',
        recipients: 'Select Recipients',
        template: 'Message Template',
        send: 'Send Message'
      }
    }
  },
  sw: {
    translation: {
      dashboard: {
        title: 'Dashibodi',
        newClient: 'Sajili Mteja Mpya',
        vehicleStatus: 'Hali ya Gari',
        search: 'Tafuta',
        all: 'Zote',
        online: 'Mtandaoni',
        offline: 'Nje ya Mtandao',
        totalVehicles: 'Jumla ya Magari',
        activeSubscriptions: 'Usajili Hai',
        registering: 'Inasajili...',
        register: 'Sajili Mteja',
        help: 'Kituo cha Usaidizi',
        reports: 'Ripoti',
        test: 'Kituo cha Majaribio',
        support: 'Wasiliana na Usaidizi',
        logout: 'Toka'
      },
      client: {
        name: 'Jina',
        phone: 'Namba ya Simu',
        bank: 'Benki/Taasisi',
        selectBank: 'Chagua Benki/Taasisi',
        carPlate: 'Namba ya Gari',
        subscription: 'Muda wa Usajili',
        startDate: 'Tarehe ya Kuanza',
        endDate: 'Tarehe ya Mwisho',
        language: 'Lugha Unayopendelea'
      },
      messages: {
        compose: 'Kituo cha Ujumbe',
        schedule: 'Panga Ujumbe',
        recipients: 'Chagua Wapokeaji',
        template: 'Kiolezo cha Ujumbe',
        send: 'Tuma Ujumbe'
      }
    }
  },
  fr: {
    translation: {
      dashboard: {
        title: 'Tableau de Bord',
        newClient: 'Enregistrer un Nouveau Client',
        vehicleStatus: 'État du Véhicule',
        search: 'Rechercher',
        all: 'Tout',
        online: 'En Ligne',
        offline: 'Hors Ligne',
        totalVehicles: 'Total des Véhicules',
        activeSubscriptions: 'Abonnements Actifs',
        registering: 'Enregistrement...',
        register: 'Enregistrer le Client',
        help: 'Centre d\'Aide',
        reports: 'Rapports',
        test: 'Centre de Test',
        support: 'Contacter le Support',
        logout: 'Déconnexion'
      },
      client: {
        name: 'Nom',
        phone: 'Numéro de Téléphone',
        bank: 'Banque/Institution',
        selectBank: 'Sélectionner Banque/Institution',
        carPlate: 'Plaque d\'Immatriculation',
        subscription: 'Période d\'Abonnement',
        startDate: 'Date de Début',
        endDate: 'Date de Fin',
        language: 'Langue Préférée'
      },
      messages: {
        compose: 'Centre de Messages',
        schedule: 'Planifier un Message',
        recipients: 'Sélectionner les Destinataires',
        template: 'Modèle de Message',
        send: 'Envoyer le Message'
      }
    }
  },
  es: {
    translation: {
      dashboard: {
        title: 'Panel de Control',
        newClient: 'Registrar Nuevo Cliente',
        vehicleStatus: 'Estado del Vehículo',
        search: 'Buscar',
        all: 'Todos',
        online: 'En Línea',
        offline: 'Fuera de Línea',
        totalVehicles: 'Total de Vehículos',
        activeSubscriptions: 'Suscripciones Activas',
        registering: 'Registrando...',
        register: 'Registrar Cliente',
        help: 'Centro de Ayuda',
        reports: 'Informes',
        test: 'Centro de Pruebas',
        support: 'Contactar Soporte',
        logout: 'Cerrar Sesión'
      },
      client: {
        name: 'Nombre',
        phone: 'Número de Teléfono',
        bank: 'Banco/Institución',
        selectBank: 'Seleccionar Banco/Institución',
        carPlate: 'Matrícula',
        subscription: 'Período de Suscripción',
        startDate: 'Fecha de Inicio',
        endDate: 'Fecha de Fin',
        language: 'Idioma Preferido'
      },
      messages: {
        compose: 'Centro de Mensajes',
        schedule: 'Programar Mensaje',
        recipients: 'Seleccionar Destinatarios',
        template: 'Plantilla de Mensaje',
        send: 'Enviar Mensaje'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;