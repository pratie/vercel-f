'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Use</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using SneakyGuy, you accept and agree to be bound by these Terms of Use and our Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Service</h2>
            <p className="text-gray-600 mb-4">
              You agree to use our service only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All content, features, and functionality of SneakyGuy are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at support@sneakyguy.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
