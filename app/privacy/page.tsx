'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            At SneakyGuy, protecting the privacy of our visitors is a top priority. This Privacy Policy outlines the types of information collected and recorded by SneakyGuy and explains how we use it.
          </p>

          <p className="text-gray-600 mb-6">
            If you have questions or need additional information about our Privacy Policy, please contact us via email at SneakyGuysaas@gmail.com.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Collection</h2>
          <p className="text-gray-600 mb-4">
            To use the SneakyGuy application, we collect the following personal data:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li className="mb-2"><strong>Email address</strong> - Used to communicate with users about app updates and billing information.</li>
          </ul>
          <p className="text-gray-600 mb-6">
            By creating an account and activating a subscription, users consent to the collection of this data.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Log Files</h2>
          <p className="text-gray-600 mb-6">
            SneakyGuy employs standard procedures for using log files. These files record visitors when they access websites, which is a common practice among all hosting companies and part of hosting services' analytics. Information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamps, referring/exit pages, and possibly the number of clicks. This information is not linked to any personally identifiable data. We use this information to analyze trends, administer the site, track user movement on the website, and gather demographic information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Web Beacons</h2>
          <p className="text-gray-600 mb-6">
            Like most websites, SneakyGuy uses 'cookies' to store information including visitors' preferences and the pages on the website that visitors access. This information helps us optimize the user experience by customizing our web content based on visitors' browser types and other information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Advertising Partners</h2>
          <p className="text-gray-600 mb-4">
            Some advertisers on our site may use cookies and web beacons. Our advertising partners include:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li className="mb-2">Google</li>
          </ul>
          <p className="text-gray-600 mb-6">
            Each advertising partner maintains their own Privacy Policy. For easier access, we maintain an updated resource with links to these policies.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Third-party Ad Servers</h2>
          <p className="text-gray-600 mb-6">
            Third-party ad servers or networks use technologies such as cookies, JavaScript, or Web Beacons in their advertisements and links that appear on SneakyGuy. These are sent directly to users' browsers, which automatically receive your IP address. These technologies measure the effectiveness of advertising campaigns and/or personalize advertising content based on websites you visit.
          </p>
          <p className="text-gray-600 mb-6">
            Please note that SneakyGuy has no access to or control over cookies used by third-party advertisers.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Privacy Policies</h2>
          <p className="text-gray-600 mb-6">
            SneakyGuy's Privacy Policy does not apply to other advertisers or websites. We recommend consulting the respective Privacy Policies of these third-party ad servers for more detailed information, including their practices and instructions for opting out of certain options.
          </p>
          <p className="text-gray-600 mb-6">
            You can disable cookies through your individual browser options. For more detailed information about cookie management with specific web browsers, please refer to your browser's official website.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Information</h2>
          <p className="text-gray-600 mb-6">
            Protecting children while they use the internet is another priority for us. We encourage parents and guardians to observe, participate in, monitor, and guide their children's online activities.
          </p>
          <p className="text-gray-600 mb-6">
            SneakyGuy does not knowingly collect any personally identifiable information from children under 13 years of age. If you believe your child has provided this type of information on our website, please contact us immediately, and we will promptly remove such information from our records.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Scope of Privacy Policy</h2>
          <p className="text-gray-600 mb-6">
            This privacy policy applies solely to our online activities and is valid for visitors to our website regarding information shared with or collected by SneakyGuy. This policy does not apply to information collected offline or through channels other than this website.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Consent</h2>
          <p className="text-gray-600 mb-6">
            By using our website, you consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: February 13, 2025
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
