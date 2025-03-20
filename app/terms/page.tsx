'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-6">
            These SneakyGuy Terms and Conditions govern your use of our website and services. By accessing or using SneakyGuy, you agree to comply with and be bound by all terms and conditions outlined in this document. If you do not agree with any part of these terms, you must not use our website or services.
          </p>
          <p className="text-gray-600 mb-6">
            Individuals under 18 years of age are not permitted to use this website.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Intellectual Property Rights</h2>
          <p className="text-gray-600 mb-6">
            Except for content you own, SneakyGuy and/or its licensors retain all intellectual property rights to materials contained on this website. You are granted a limited license solely for the purpose of viewing the content on this website.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Restrictions</h2>
          <p className="text-gray-600 mb-4">
            You are specifically prohibited from:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li className="mb-2">Publishing any SneakyGuy material in other media</li>
            <li className="mb-2">Selling, sublicensing, or commercializing any SneakyGuy material</li>
            <li className="mb-2">Publicly performing or displaying any SneakyGuy material</li>
            <li className="mb-2">Using SneakyGuy in any way that could damage the website</li>
            <li className="mb-2">Using SneakyGuy in a manner that impacts other users' access</li>
            <li className="mb-2">Using SneakyGuy contrary to applicable laws or in ways that could harm the website or any person/entity</li>
            <li className="mb-2">Engaging in data mining, data harvesting, data extraction, or similar activities</li>
            <li className="mb-2">Using SneakyGuy for advertising or marketing purposes</li>
          </ul>
          <p className="text-gray-600 mb-6">
            SneakyGuy may restrict your access to certain areas of the website at any time at our discretion. Any user credentials provided for this website are confidential, and you must maintain their confidentiality.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Content</h2>
          <p className="text-gray-600 mb-6">
            'Your Content' refers to any audio, video, text, images, or other material you choose to display on SneakyGuy. By displaying Your Content, you grant SneakyGuy a non-exclusive, worldwide, irrevocable, sublicensable license to use, reproduce, adapt, publish, translate, and distribute it in any media.
          </p>
          <p className="text-gray-600 mb-6">
            Your Content must be your own and must not infringe on any third party's rights. SneakyGuy reserves the right to remove any of Your Content at any time without notice.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">No Warranties</h2>
          <p className="text-gray-600 mb-6">
            SneakyGuy is provided 'as is' with all faults. We make no representations or warranties of any kind regarding this website or the materials it contains. Nothing on this website should be interpreted as advice.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-6">
            In no event shall SneakyGuy or its officers, directors, and employees be held liable for anything arising out of or connected with your use of this website, whether under contract or otherwise. SneakyGuy and its team shall not be held liable for any indirect, consequential, or special liability arising from your use of this website.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Indemnification</h2>
          <p className="text-gray-600 mb-6">
            You agree to indemnify SneakyGuy to the fullest extent from and against all liabilities, costs, demands, causes of action, damages, and expenses arising from your breach of any provisions of these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Severability</h2>
          <p className="text-gray-600 mb-6">
            If any provision of these Terms is found to be invalid under applicable law, that provision will be removed without affecting the remaining provisions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Variation of Terms</h2>
          <p className="text-gray-600 mb-6">
            SneakyGuy may revise these Terms at any time as necessary. By using this website, you accept responsibility for reviewing these Terms regularly.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Assignment</h2>
          <p className="text-gray-600 mb-6">
            SneakyGuy may assign, transfer, and subcontract its rights and/or obligations under these Terms without notification. You may not assign, transfer, or subcontract any of your rights or obligations under these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Entire Agreement</h2>
          <p className="text-gray-600 mb-6">
            These Terms constitute the entire agreement between SneakyGuy and you regarding your use of this website, superseding all prior agreements and understandings.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Governing Law & Jurisdiction</h2>
          <p className="text-gray-600 mb-6">
            These Terms will be governed by and interpreted according to the laws of the State of New York. You submit to the non-exclusive jurisdiction of state and federal courts located in New York for the resolution of any disputes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Refund Policy</h2>
          <p className="text-gray-600 mb-6">
            We offer refunds within 7 days of purchase if you have not used the product. To request a refund, please contact us at SneakyGuysaas@gmail.com.
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
