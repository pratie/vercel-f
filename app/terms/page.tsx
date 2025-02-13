'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-6">
              These SNEAKYGUY Standard Terms and Conditions written on this webpage shall manage your use of this website. These Terms will be applied fully and affect to your use of SNEAKYGUY. By using this Website, you agreed to accept all terms and conditions written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions.
            </p>
            <p className="text-gray-600 mb-6">
              Minors or people below 18 years old are not allowed to use this Website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-600 mb-6">
              Other than the content you own, under these Terms, SNEAKYGUY and/or its licensors own all the intellectual property rights and materials contained in this Website.
            </p>
            <p className="text-gray-600 mb-6">
              You are granted limited license only for purposes of viewing the material contained on this Website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Restrictions</h2>
            <p className="text-gray-600 mb-4">You are specifically restricted from all of the following:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>publishing any Website material in any other media;</li>
              <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
              <li>publicly performing and/or showing any Website material;</li>
              <li>using this Website in any way that is or may be damaging to this Website;</li>
              <li>using this Website in any way that impacts user access to this Website;</li>
              <li>using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
              <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;</li>
              <li>using this Website to engage in any advertising or marketing.</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Certain areas of this Website are restricted from being access by you and SNEAKYGUY may further restrict access by you to any areas of this Website, at any time, in absolute discretion. Any user ID and password you may have for this Website are confidential and you must maintain confidentiality as well.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Your Content</h2>
            <p className="text-gray-600 mb-6">
              In these Website Standard Terms and Conditions, 'Your Content' shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant SNEAKYGUY a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
            </p>
            <p className="text-gray-600 mb-6">
              Your Content must be your own and must not be invading any third-party's rights. SNEAKYGUY reserves the right to remove any of Your Content from this Website at any time without notice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">No warranties</h2>
            <p className="text-gray-600 mb-6">
              This Website is provided 'as is', with all faults, and SNEAKYGUY express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Limitation of liability</h2>
            <p className="text-gray-600 mb-6">
              In no event shall SNEAKYGUY, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. SNEAKYGUY, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Indemnification</h2>
            <p className="text-gray-600 mb-6">
              You hereby indemnify to the fullest extent SNEAKYGUY from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Severability</h2>
            <p className="text-gray-600 mb-6">
              If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Variation of Terms</h2>
            <p className="text-gray-600 mb-6">
              SNEAKYGUY is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Assignment</h2>
            <p className="text-gray-600 mb-6">
              SNEAKYGUY is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Entire Agreement</h2>
            <p className="text-gray-600 mb-6">
              These Terms constitute the entire agreement between SNEAKYGUY and you in relation to your use of this Website, and supersede all prior agreements and understandings.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Governing Law & Jurisdiction</h2>
            <p className="text-gray-600 mb-6">
              These Terms will be governed by and interpreted in accordance with the laws of the State of New York, and you submit to the non-exclusive jurisdiction of the state and federal courts located in New York for the resolution of any disputes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">No App Warranties</h2>
            <p className="text-gray-600 mb-6">
              This assistant is provided 'as is', with all faults, and SNEAKYGUY express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
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
