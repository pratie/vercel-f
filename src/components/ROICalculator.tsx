'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, DollarSign, Mail, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

export function ROICalculator() {
  const [businessPrice, setBusinessPrice] = useState(100);
  const [conversionRate, setConversionRate] = useState(2);
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [results, setResults] = useState({
    leadsNeeded: 0,
    redditCost: 39,
    emailCost: 0,
    linkedinCost: 0,
    redditROI: 0,
    emailROI: 0,
    linkedinROI: 0
  });

  useEffect(() => {
    calculateROI();
  }, [businessPrice, conversionRate, monthlyTarget]);

  const calculateROI = () => {
    const leadsNeeded = Math.ceil(monthlyTarget / businessPrice);
    const visitsNeeded = Math.ceil(leadsNeeded / (conversionRate / 100));
    
    // Reddit costs (SneakyGuy one-time + time saved)
    const redditCost = 39; // One-time payment
    
    // Email marketing costs (tools + time)
    const emailCost = (visitsNeeded * 0.15) + 100; // $0.15 per lead + tools
    
    // LinkedIn DM costs (premium + time)
    const linkedinCost = (visitsNeeded * 0.50) + 200; // $0.50 per outreach + premium
    
    // Calculate annual ROI
    const annualRevenue = monthlyTarget * 12;
    const redditROI = ((annualRevenue - redditCost) / redditCost) * 100;
    const emailROI = ((annualRevenue - (emailCost * 12)) / (emailCost * 12)) * 100;
    const linkedinROI = ((annualRevenue - (linkedinCost * 12)) / (linkedinCost * 12)) * 100;

    setResults({
      leadsNeeded,
      redditCost,
      emailCost: emailCost * 12, // Annual cost
      linkedinCost: linkedinCost * 12, // Annual cost
      redditROI,
      emailROI,
      linkedinROI
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 mb-6"
          >
            <Calculator className="h-4 w-4 mr-2" />
            <span>ROI Calculator</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-heading"
          >
            Why Reddit is a <span className="text-[#ff4500]">Goldmine</span><br />
            for Authentic Leads
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Unlike cold emails or LinkedIn DMs, Reddit users are actively seeking solutions. 
            Calculate how much more cost-effective SneakyGuy is compared to traditional lead generation.
          </motion.p>
        </div>

        {/* Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Input Section */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 font-heading">Your Business Metrics</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Selling Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={businessPrice}
                    onChange={(e) => setBusinessPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] text-lg font-medium"
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Conversion Rate (%)
                  <span className="ml-1 text-gray-400" title="Percentage of visitors who become customers">ⓘ</span>
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] text-lg font-medium"
                    placeholder="2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Revenue Target ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] text-lg font-medium"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Reddit/SneakyGuy */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-gradient-to-br from-[#ff4500] to-[#ff6b3d] rounded-xl p-6 text-white"
              >
                <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-sm font-semibold">Best Value</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Reddit + SneakyGuy</h4>
                    <p className="text-sm text-white/80">Authentic conversations</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Annual Cost:</span>
                    <span className="font-bold">${results.redditCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual ROI:</span>
                    <span className="font-bold">{results.redditROI.toLocaleString()}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Leads needed:</span>
                    <span>{results.leadsNeeded}/month</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>One-time payment</span>
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>High engagement rates</span>
                  </div>
                </div>
              </motion.div>

              {/* Email Marketing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <Mail className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Cold Email</h4>
                    <p className="text-sm text-gray-600">Mass outreach</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Annual Cost:</span>
                    <span className="font-bold">${results.emailCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual ROI:</span>
                    <span className="font-bold">{results.emailROI.toLocaleString()}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Avg. open rate:</span>
                    <span>~1-3%</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 mr-2 text-red-500">✗</span>
                    <span>Recurring monthly costs</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span className="w-4 h-4 mr-2 text-red-500">✗</span>
                    <span>Low engagement</span>
                  </div>
                </div>
              </motion.div>

              {/* LinkedIn DMs */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">LinkedIn DMs</h4>
                    <p className="text-sm text-gray-600">Professional network</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Annual Cost:</span>
                    <span className="font-bold">${results.linkedinCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual ROI:</span>
                    <span className="font-bold">{results.linkedinROI.toLocaleString()}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Avg. response rate:</span>
                    <span>~5-10%</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 mr-2 text-red-500">✗</span>
                    <span>High monthly costs</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span className="w-4 h-4 mr-2 text-red-500">✗</span>
                    <span>Time-intensive</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Insights */}
            <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Why Reddit Wins</h4>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">Higher Intent</h5>
                  <p className="text-sm text-gray-600">Users actively seek solutions, not avoiding sales messages</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">Authentic Engagement</h5>
                  <p className="text-sm text-gray-600">Build trust through valuable contributions, not pitches</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">Incredible ROI</h5>
                  <p className="text-sm text-gray-600">One-time investment vs. recurring monthly costs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to achieve {results.redditROI.toLocaleString()}% ROI with Reddit lead generation?
          </p>
          <button className="bg-[#ff4500] hover:bg-[#ff6b3d] text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl">
            Start Finding Leads Now
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}