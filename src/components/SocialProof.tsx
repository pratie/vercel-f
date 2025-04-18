import React from 'react';
import { ArrowRight, Twitter } from 'lucide-react';
import Link from 'next/link';

const SocialProof: React.FC = () => (
  <div className="bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold text-gray-900">What People Are Saying</h2>
        <p className="text-[15px] text-gray-600">Real feedback from our users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
        {/* Twitter Card 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-purple-700">SK</span>
              </div>
              <div className="ml-3 truncate">
                <h3 className="text-[15px] font-semibold text-gray-900 leading-none mb-1">Sara Kamdod</h3>
                <p className="text-[13px] text-gray-500 leading-none">@sara_kamdod</p>
              </div>
            </div>
            <Twitter className="h-4 w-4 text-[#1DA1F2] flex-shrink-0 ml-4" />
          </div>
          <p className="text-[15px] leading-[1.3] text-gray-900 mb-2.5">
            "Just discovered @sneakyguysaas - it's revolutionizing how we find leads on Reddit! The AI responses are spot-on and it's already bringing in quality leads. Game-changer for anyone doing B2B marketing 🚀"
          </p>
          <div className="flex items-center text-[13px] text-gray-500">
            <Link href="https://x.com/sara_kamdod" target="_blank" className="hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              View on X
            </Link>
          </div>
        </div>

        {/* Twitter Card 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-700">RM</span>
              </div>
              <div className="ml-3 truncate">
                <h3 className="text-[15px] font-semibold text-gray-900 leading-none mb-1">Ryan Martinez</h3>
                <p className="text-[13px] text-gray-500 leading-none">@snow_stark17</p>
              </div>
            </div>
            <Twitter className="h-4 w-4 text-[#1DA1F2] flex-shrink-0 ml-4" />
          </div>
          <p className="text-[15px] leading-[1.3] text-gray-900 mb-2.5">
            "As the founder of @rapidshorts, finding the right leads is crucial. @sneakyguysaas has been incredible - it's like having a 24/7 lead gen team on Reddit. The AI understands context perfectly! 💯"
          </p>
          <div className="flex items-center text-[13px] text-gray-500">
            <Link href="https://x.com/snow_stark17" target="_blank" className="hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              View on X
            </Link>
          </div>
        </div>
      </div>

      {/* User Group Display */}
      <div className="text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center -space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-[#ff4500] flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">TK</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">AM</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-green-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">RJ</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-yellow-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">+</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-900">Join 50+ happy customers</p>
          <p className="text-[15px] text-gray-500 mt-1">From startups to enterprises, teams love SneakyGuy</p>
        </div>
      </div>
    </div>
  </div>
);

export default SocialProof;
