import { Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  HelpCircle, 
  FileText, 
  TestTube2, 
  LogOut, 
  Mail,
  MessageSquare,
  Settings
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function Layout({ session }) {
  const location = useLocation();
  const { t } = useTranslation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('messages.compose'), href: '/messages', icon: MessageSquare },
    { name: t('dashboard.help'), href: '/help', icon: HelpCircle },
    { name: t('dashboard.reports'), href: '/reports', icon: FileText },
    { name: t('dashboard.test'), href: '/test', icon: TestTube2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Reflex Technologies
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <LanguageSelector />
              <a 
                href="mailto:reflextechnologies13@gmail.com"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('dashboard.support')}
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t('dashboard.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-88px)] border-r border-blue-100">
          <nav className="mt-5 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-base font-medium rounded-lg mb-1 transition-colors
                    ${location.pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-blue-600'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8 max-w-[calc(100vw-16rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}