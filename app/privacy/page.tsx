'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="bg-white shadow-sm rounded-2xl px-6 py-8 sm:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              At SNEAKYGUY, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SNEAKYGUY and how we use it.
            </p>

            <p className="text-gray-600 mb-6">
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at sneakyguysaas@gmail.com
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Collection</h2>
            <p className="text-gray-600 mb-4">
              In order to use the SNEAKYGUY application, the following personal data will be collected:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li className="mb-2">Email address - Used to contact users about app updates, and billing information.</li>
              <li className="mb-2">Billing information (stored by Stripe, not accessible to SNEAKYGUY directly) - Used to establish a subscription to enable the features of the application.</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Upon creating an account and activating a subscription, users agree to the collection of this data.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Log Files</h2>
            <p className="text-gray-600 mb-6">
              SNEAKYGUY follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Web Beacons</h2>
            <p className="text-gray-600 mb-6">
              Like any other website, SNEAKYGUY uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Advertising Partners</h2>
            <p className="text-gray-600 mb-6">
              Some of advertisers on our site may use cookies and web beacons. Our advertising partners include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Google</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Third Party Privacy Policies</h2>
            <p className="text-gray-600 mb-6">
              SNEAKYGUY's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Children's Information</h2>
            <p className="text-gray-600 mb-6">
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
            </p>
            <p className="text-gray-600 mb-6">
              SNEAKYGUY does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Online Privacy Policy Only</h2>
            <p className="text-gray-600 mb-6">
              This privacy policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in SNEAKYGUY. This policy is not applicable to any information collected offline or via channels other than this website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Consent</h2>
            <p className="text-gray-600 mb-6">
              By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: February 13, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
