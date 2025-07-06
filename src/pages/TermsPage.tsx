import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to App</span>
          </Link>
          
          <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Terms of Service
                </h1>
                <p className="text-gray-600 mt-1">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Agreement Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Agreement to Terms
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Vibe Shots ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Service Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vibe Shots is an AI-powered platform that automates video content creation and scheduling for TikTok. Our service includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>AI-generated video scripts based on user ideas</li>
                  <li>Automated voice synthesis and video generation</li>
                  <li>Scheduled posting to TikTok platforms</li>
                  <li>Analytics and performance tracking</li>
                  <li>Content optimization recommendations</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Responsibilities</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">By using our service, you agree to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the service only for lawful purposes</li>
                  <li>Not create content that violates TikTok's community guidelines</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not attempt to reverse engineer or hack our systems</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </div>
            </section>

            {/* Content Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Content Policy</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Important Notice</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      You are responsible for ensuring all generated content complies with applicable laws and platform policies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">Prohibited content includes but is not limited to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Hate speech, harassment, or discriminatory content</li>
                  <li>Violent, graphic, or disturbing material</li>
                  <li>Sexually explicit or inappropriate content</li>
                  <li>Misinformation or false claims</li>
                  <li>Copyright or trademark infringement</li>
                  <li>Spam or misleading content</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Terms</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vibe Shots operates on a subscription-based model. By subscribing, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Pay all fees associated with your chosen plan</li>
                  <li>Automatic renewal unless cancelled before the next billing cycle</li>
                  <li>No refunds for partial months of service</li>
                  <li>Price changes with 30 days advance notice</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Vibe Shots provides the service "as is" without warranties of any kind. We are not liable for any damages arising from 
                  the use of our service, including but not limited to loss of revenue, data, or business opportunities. Our liability 
                  is limited to the amount paid for the service in the preceding 12 months.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Termination</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Either party may terminate this agreement at any time. Upon termination, your access to the service will cease, 
                  and we may delete your data after a reasonable grace period. Sections regarding liability, indemnification, 
                  and dispute resolution will survive termination.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to Terms</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <p className="text-purple-800 font-medium">Email: legal@vibeshots.com</p>
                  <p className="text-purple-800">Address: 123 Innovation Drive, Tech City, TC 12345</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};