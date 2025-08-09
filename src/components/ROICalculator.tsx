'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, DollarSign, Mail, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

export function ROICalculator() {
  const [businessPrice, setBusinessPrice] = useState(100);
  const [conversionRate, setConversionRate] = useState(2);
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [selectedPlan, setSelectedPlan] = useState('annual'); // Default to annual
  const [results, setResults] = useState({
    leadsNeeded: 0,
    redditCost: 69, // Default to annual pricing
    redditReplyRate: 30,
    redditMessagesNeeded: 0,
    emailCost: 0,
    emailReplyRate: 3,
    emailMessagesNeeded: 0,
    linkedinCost: 0,
    linkedinReplyRate: 10,
    linkedinMessagesNeeded: 0
  });

  const pricingPlans = {
    monthly: { price: 9, duration: 1, label: '$9/month' },
    '6month': { price: 39, duration: 6, label: '$39/6 months' },
    annual: { price: 69, duration: 12, label: '$69/year' }
  };

  useEffect(() => {
    calculateROI();
  }, [businessPrice, conversionRate, monthlyTarget, selectedPlan]);

  const calculateROI = () => {
    const leadsNeeded = Math.ceil(monthlyTarget / businessPrice);
    
    // Reddit with SneakyGuy (realistic engagement rates)
    const redditReplyRate = 30; // 30% reply rate (much higher than cold outreach)
    const redditMessagesNeeded = Math.ceil(leadsNeeded / (redditReplyRate / 100));
    const selectedPlanData = pricingPlans[selectedPlan as keyof typeof pricingPlans];
    const redditCost = selectedPlanData.price; // Based on selected plan
    
    // Cold Email (realistic rates)
    const emailReplyRate = 3; // 3% reply rate
    const emailMessagesNeeded = Math.ceil(leadsNeeded / (emailReplyRate / 100));
    const emailCostPerMessage = 0.10; // $0.10 per email
    const emailToolsCost = 100; // Monthly email tools
    const emailTotalCost = (emailMessagesNeeded * emailCostPerMessage) + (emailToolsCost * 12);
    
    // LinkedIn DMs (realistic rates)
    const linkedinReplyRate = 10; // 10% reply rate
    const linkedinMessagesNeeded = Math.ceil(leadsNeeded / (linkedinReplyRate / 100));
    const linkedinCostPerMessage = 0.25; // $0.25 per outreach
    const linkedinPremiumCost = 60; // Monthly premium
    const linkedinTotalCost = (linkedinMessagesNeeded * linkedinCostPerMessage) + (linkedinPremiumCost * 12);

    setResults({
      leadsNeeded,
      redditCost,
      redditReplyRate,
      redditMessagesNeeded,
      emailCost: emailTotalCost,
      emailReplyRate,
      emailMessagesNeeded,
      linkedinCost: linkedinTotalCost,
      linkedinReplyRate,
      linkedinMessagesNeeded
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
            Why Reddit is a <span className="text-[hsl(var(--primary))]">Goldmine</span><br />
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
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] text-lg font-medium"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] text-lg font-medium"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] text-lg font-medium"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose SneakyGuy Plan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(pricingPlans).map(([planId, plan]) => (
                  <button
                    key={planId}
                    onClick={() => setSelectedPlan(planId)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedPlan === planId 
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] ring-2 ring-[hsl(var(--primary))]/20' 
                        : 'border-gray-200 hover:border-[hsl(var(--primary))]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{plan.label}</span>
                      {planId === 'annual' && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Best Value
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {planId === 'monthly' ? 'Flexible monthly billing' : 
                       planId === '6month' ? 'Save 28% vs monthly' : 
                       'Save 36% vs monthly'}
                    </div>
                  </button>
                ))}
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
                className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200"
              >
                <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full px-3 py-1">
                  <span className="text-sm font-semibold">Recommended</span>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Reddit (SneakyGuy)</h4>
                  <p className="text-sm text-gray-600">Authentic conversations</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reply Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{results.redditReplyRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Messages Needed</p>
                    <p className="text-2xl font-bold text-gray-900">{results.redditMessagesNeeded.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-green-600">${results.redditCost}</span>
                  </div>
                  <p className="text-sm font-medium text-green-700">Most efficient</p>
                </div>
              </motion.div>

              {/* Email Marketing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Cold Email</h4>
                  <p className="text-sm text-gray-600">Mass outreach</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reply Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{results.emailReplyRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Messages Needed</p>
                    <p className="text-2xl font-bold text-gray-900">{results.emailMessagesNeeded.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-gray-900">${results.emailCost.toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-red-600">
                    {(results.emailCost / results.redditCost).toFixed(1)}x more expensive
                  </p>
                </div>
              </motion.div>

              {/* LinkedIn DMs */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">LinkedIn DMs</h4>
                  <p className="text-sm text-gray-600">Professional network</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reply Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{results.linkedinReplyRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Messages Needed</p>
                    <p className="text-2xl font-bold text-gray-900">{results.linkedinMessagesNeeded.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-blue-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-gray-900">${results.linkedinCost.toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-red-600">
                    {(results.linkedinCost / results.redditCost).toFixed(1)}x more expensive
                  </p>
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
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Save ${Math.max(results.emailCost - results.redditCost, results.linkedinCost - results.redditCost).toLocaleString()} annually
            </h3>
            <p className="text-lg mb-6 text-white/90">
              {pricingPlans[selectedPlan as keyof typeof pricingPlans].label} vs thousands in recurring costs
            </p>
            <button className="bg-white text-[hsl(var(--primary))] font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              Get SneakyGuy for {pricingPlans[selectedPlan as keyof typeof pricingPlans].label}
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}