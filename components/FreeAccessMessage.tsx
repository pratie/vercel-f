import { ArrowRight, Mail, Sparkles } from 'lucide-react';

export function FreeAccessMessage() {
  return (
    <div className="mt-12 mb-20 bg-[hsl(var(--secondary))] rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
        <span className="text-lg font-medium text-gray-900">Psst! Want to be an early adopter? 🚀</span>
      </div>
      <p className="text-gray-600 mb-6">
        I'm an indie hacker building this tool and would love your feedback! Send me an email for free access - let's make this tool awesome together!
      </p>
      <div 
        className="flex items-center justify-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" 
        onClick={() => window.location.href = 'mailto:sneakyguysaas@gmail.com'}
      >
        <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
        <span className="text-gray-900 font-medium">sneakyguysaas@gmail.com</span>
        <ArrowRight className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
    </div>
  );
}
