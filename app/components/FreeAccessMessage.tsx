import { ArrowRight, Mail, Sparkles } from 'lucide-react';

export function FreeAccessMessage() {
  return (
    <div className="mt-6 sm:mt-12 bg-gradient-to-br from-[hsl(var(--secondary))] to-white rounded-xl sm:rounded-2xl p-5 sm:p-8 mx-4 sm:mx-auto max-w-2xl shadow-sm border border-[hsl(var(--primary))]/10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5 sm:mb-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[hsl(var(--primary))]/10">
          <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <span className="text-[15px] sm:text-lg font-semibold text-gray-900">Psst! Want to be an early adopter? 🚀</span>
      </div>
      
      <div className="max-w-xl mx-auto">
        <p className="text-[15px] leading-relaxed sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
          I'm an indie hacker building this tool and would love your feedback! Send me an email for free access - let's make this tool <span className="text-[hsl(var(--primary))] font-medium">awesome</span> together!
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="text-[13px] leading-relaxed sm:text-sm italic text-gray-600 max-w-[280px] sm:max-w-md text-center px-4 py-2.5 rounded-lg bg-white/50 border border-[hsl(var(--primary))]/10">
            ✨ Bonus: Got a specific feature in mind? I'd be happy to build custom features just for you! ✨
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          className="group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--primary))] text-white px-5 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 max-w-[320px] sm:max-w-[360px]" 
          onClick={() => window.location.href = 'mailto:sneakyguysaas@gmail.com'}
        >
          <Mail className="h-[18px] w-[18px] sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-[15px] sm:text-base font-medium truncate">sneakyguysaas@gmail.com</span>
          <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
