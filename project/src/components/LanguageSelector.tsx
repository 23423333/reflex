import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center">
      <Globe className="w-5 h-5 text-gray-500 mr-2" />
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="en">English</option>
        <option value="sw">Kiswahili</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}