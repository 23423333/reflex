# Vehicle Tracking Management System

A comprehensive web application for managing vehicle tracking subscriptions, client communications, and system monitoring.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Internationalization](#internationalization)
- [Components](#components)
- [API Integration](#api-integration)

## Features

### Dashboard
- Client registration with vehicle tracking
- Real-time vehicle status monitoring
- Multi-language support (English, Kiswahili, French, Spanish)
- Bank/Institution categorization
- Advanced search and filtering
- Subscription management

### Messaging Center
- Bulk SMS messaging
- Message scheduling
- Pre-built message templates in multiple languages
- Client grouping and filtering
- Message history tracking
- Real-time delivery status

### Reports
- Customizable date range reporting
- Vehicle status reports
- Subscription analytics
- CSV export functionality
- Client activity tracking

### Help Center
- Direct support contact information
- FAQ section
- Live chat integration
- Multi-language support documentation

### Test Center
- System health monitoring
- Database connection testing
- API endpoint validation
- Real-time status reporting

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Internationalization**: i18next
- **Type Safety**: TypeScript
- **Date Handling**: date-fns
- **Calendar**: react-calendar
- **SMS Integration**: Twilio (prepared)

## Getting Started

1. **Environment Setup**
   ```bash
   # Clone the repository
   git clone [repository-url]
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   ```

2. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
   VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
   VITE_TWILIO_PHONE_NUMBER=your_twilio_phone
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Layout.tsx      # App layout
│   ├── Login.tsx       # Authentication
│   └── ...
├── lib/                # Utilities and services
│   ├── supabase.ts     # Database client
│   ├── i18n.ts         # Internationalization
│   └── smsService.ts   # SMS functionality
└── main.tsx            # Application entry
```

## Authentication

The system uses Supabase Authentication with email/password login. Session management is handled automatically through Supabase's client library.

```typescript
// Login Implementation
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Session Management
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});
```

## Database Schema

### Clients Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  bank TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  car_plate TEXT UNIQUE NOT NULL,
  subscription_start DATE NOT NULL,
  subscription_end DATE NOT NULL,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Scheduled Messages Table
```sql
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  schedule_date TIMESTAMPTZ NOT NULL,
  message_type TEXT NOT NULL,
  recipients UUID[] NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Internationalization

The application supports four languages:
- English (default)
- Kiswahili
- French
- Spanish

Language files are structured using i18next with separate namespaces for different sections of the application.

```typescript
// Language Selection
const { i18n } = useTranslation();
i18n.changeLanguage(selectedLanguage);
```

## Components

### Dashboard Component
The main interface for client and vehicle management:
- Client registration
- Vehicle tracking
- Status monitoring
- Bank/Institution filtering

### MessagingCenter Component
Handles all communication features:
- Bulk messaging
- Message scheduling
- Template management
- Recipient grouping

### Reports Component
Generates system reports:
- Date range selection
- Status filtering
- CSV export
- Data visualization

### TestCenter Component
System diagnostics and testing:
- Database connectivity
- API endpoint testing
- Service health checks

## API Integration

### SMS Service
The system is prepared for Twilio SMS integration:

```typescript
const sendSMS = async ({ to, message }: SendSMSParams) => {
  // Production implementation with Twilio
  const response = await fetch('/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message })
  });
  return response.json();
};
```

### Supabase Integration
Database operations are handled through Supabase client:

```typescript
const supabase = createClient(supabaseUrl, supabaseKey);

// Example query
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('name');
```

## Security Considerations

1. **Authentication**
   - Email/password authentication
   - Session management
   - Protected routes

2. **Database Security**
   - Row Level Security (RLS)
   - Prepared statements
   - Input validation

3. **API Security**
   - Environment variables
   - Rate limiting
   - Error handling

## Best Practices

1. **Code Organization**
   - Component-based architecture
   - Separation of concerns
   - Type safety with TypeScript

2. **Performance**
   - Lazy loading
   - Optimized queries
   - Efficient state management

3. **Maintenance**
   - Comprehensive documentation
   - Code comments
   - Version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.