import { Mail, Phone, MessageSquare, FileQuestion } from 'lucide-react';

export default function HelpCenter() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="w-6 h-6 mr-2" />
            Email Support
          </h2>
          <p className="text-gray-600 mb-4">
            For general inquiries and support, reach out to us at:
          </p>
          <a
            href="mailto:reflextechnologies13@gmail.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            reflextechnologies13@gmail.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Phone className="w-6 h-6 mr-2" />
            Phone Support
          </h2>
          <p className="text-gray-600 mb-4">
            For urgent matters, contact our support line:
          </p>
          <a
            href="tel:0750912008"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            0704529999
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileQuestion className="w-6 h-6 mr-2" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">How do I renew my subscription?</h3>
            <p className="text-gray-600">
              Contact our support team via email or phone to process your renewal. We'll guide you through the process and ensure continuous service.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">What happens when my subscription expires?</h3>
            <p className="text-gray-600">
              You'll receive a notification before expiration. To avoid service interruption, please renew before the expiration date.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">How do I update my contact information?</h3>
            <p className="text-gray-600">
              Contact our support team with your updated information, and we'll help you make the necessary changes to your account.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Live Chat Support
        </h2>
        <p className="text-gray-600">
          Our live chat support is available during business hours. Click the chat icon in the bottom right corner to start a conversation with our support team.
        </p>
      </div>
    </div>
  );
}