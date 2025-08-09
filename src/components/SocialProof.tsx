import React from 'react';
import { ArrowRight, Twitter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const SocialProof: React.FC = () => (
  <div className="bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-[28px] font-bold text-gray-900">What People Are Saying</h2>
        <p className="text-[15px] text-gray-600 mt-2">Real feedback from our users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {/* Twitter Card 1 */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/testimonials/andremflores.jpg"
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="ml-3 truncate">
                <h3 className="text-[15px] font-semibold text-gray-900 leading-none mb-1">Andrem Flores</h3>
                <p className="text-[13px] text-gray-500 leading-none">@andremflores</p>
              </div>
            </div>
            <Twitter className="h-4 w-4 text-[#1DA1F2] flex-shrink-0 ml-4" />
          </div>
          <p className="text-[15px] leading-relaxed text-gray-900 mb-4">
            I love the app, I see a lot of potential with it tbh
          </p>
          <div className="flex items-center text-[13px] text-gray-500">
            <Link href="https://x.com/andremflores" target="_blank" className="hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              View on X
            </Link>
          </div>
        </div>

        {/* Twitter Card 2 */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/testimonials/govbidmike.jpg"
                  alt=""
                  width={40}    
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="ml-3 truncate">
                <h3 className="text-[15px] font-semibold text-gray-900 leading-none mb-1">GovBidMike</h3>
                <p className="text-[13px] text-gray-500 leading-none">@GovBidMike</p>
              </div>
            </div>
            <Twitter className="h-4 w-4 text-[#1DA1F2] flex-shrink-0 ml-4" />
          </div>
          <p className="text-[15px] leading-relaxed text-gray-900 mb-4">
            Find all the subreddits automatically and relevant reddit posts is very helpful. Saves a ton of time. The auto generated responses aren't exactly what I'd like, but they're a good starting point. I'll play with it a bit. The tool has a lot of potential
          </p>
          <div className="flex items-center text-[13px] text-gray-500">
            <Link href="https://x.com/GovBidMike" target="_blank" className="hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              View on X
            </Link>
          </div>
        </div>

        {/* Twitter Card 3 */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/testimonials/eris_margeta.jpg"
                  alt="Eris Margeta"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="ml-3 truncate">
                <h3 className="text-[15px] font-semibold text-gray-900 leading-none mb-1">Eris Margeta</h3>
                <p className="text-[13px] text-gray-500 leading-none">@eris_margeta</p>
              </div>
            </div>
            <Twitter className="h-4 w-4 text-[#1DA1F2] flex-shrink-0 ml-4" />
          </div>
          <p className="text-[15px] leading-relaxed text-gray-900 mb-4">
            I am so thankful for this. You have a killer tool
          </p>
          <div className="flex items-center text-[13px] text-gray-500">
            <Link href="https://x.com/eris_margeta" target="_blank" className="hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
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
            <div className="w-12 h-12 rounded-full border-2 border-white bg-[hsl(var(--primary))] flex items-center justify-center">
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
