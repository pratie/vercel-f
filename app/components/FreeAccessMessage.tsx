import { ArrowRight, Mail, Sparkles } from 'lucide-react';

export function FreeAccessMessage() {
  return (
    <div className="relative mt-6 sm:mt-12 mx-4 sm:mx-auto max-w-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-orange-50/50 rounded-xl sm:rounded-2xl blur-xl opacity-50"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 via-[#ff4500]/10 to-[#ff6634]/10 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main Content */}
      <div className="relative bg-gradient-to-br from-white/80 via-white to-orange-50/80 backdrop-blur rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-orange-200/30 hover:shadow-orange-200/50 transition-all duration-300 animate-fade-in-up group">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 sm:mb-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-[#ff6634] blur-lg opacity-50 rounded-xl"></div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-[#ff4500] to-[#ff6634] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer relative">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          <span className="text-base sm:text-lg font-semibold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text hover:from-orange-500 hover:to-[#ff4500] transition-all duration-300 cursor-default group-hover:scale-105">
            Psst! Want to be an early adopter? 🚀
          </span>
        </div>
        
        <div className="max-w-xl mx-auto space-y-6">
          <p className="text-[15px] leading-relaxed sm:text-base text-gray-600 text-center">
            I'm an indie hacker building this tool and would love your feedback! Send me an email for free access - let's make this tool{" "}
            <span className="relative inline-block group cursor-default">
              <span className="font-semibold bg-gradient-to-r from-orange-500 to-[#ff4500] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                awesome
              </span>
              <span className="absolute -inset-1 bg-orange-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </span>
            {" "}together!
          </p>
          
          <div className="flex justify-center">
            <div className="relative text-[13px] leading-relaxed sm:text-sm italic text-gray-600 max-w-[280px] sm:max-w-md text-center px-5 py-3 rounded-lg bg-gradient-to-r from-white/80 via-white to-orange-50/80 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:scale-105 group cursor-default">
              <span className="absolute -inset-1 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
              <span className="relative inline-flex items-center gap-1">
                <span className="animate-bounce-slow">✨</span>
                Bonus: Got a specific feature in mind? I'd be happy to build custom features just for you!
                <span className="animate-bounce-slow delay-100">✨</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button 
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 via-[#ff4500] to-[#ff6634] hover:from-[#ff4500] hover:to-[#ff6634] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 max-w-[280px] border border-orange-200/30 hover:border-orange-300/50 overflow-hidden" 
            onClick={() => window.location.href = 'mailto:sneakyguysaas@gmail.com'}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500/50 to-[#ff6634]/50 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
            <Mail className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[15px] sm:text-base font-medium truncate group-hover:scale-105 transition-transform duration-300">
              sneakyguysaas@gmail.com
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
