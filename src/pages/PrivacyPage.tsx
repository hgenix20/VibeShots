import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Privacy Policy
                </h1>
                <p className="text-gray-600 mt-1">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Our Commitment to Privacy
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  At Vibe Shots, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you use our AI-powered video content creation and scheduling service. 
                  Please read this privacy policy carefully.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Email address and account credentials</li>
                    <li>Profile information and preferences</li>
                    <li>Payment and billing information</li>
                    <li>Communication preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Content Data</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Video ideas and text content you submit</li>
                    <li>Generated scripts, audio, and video files</li>
                    <li>TikTok account information and posting preferences</li>
                    <li>Analytics and performance data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Usage patterns and feature interactions</li>
                    <li>Error logs and performance metrics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide and maintain our AI content generation services</li>
                  <li>Process payments and manage your subscription</li>
                  <li>Generate personalized content and recommendations</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-purple-600" />
                Information Sharing and Disclosure
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">We may share your information in the following circumstances:</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800">Third-Party Services</h3>
                    <p className="text-gray-700 text-sm">
                      We use trusted third-party services for AI processing (OpenAI, Hugging Face), cloud storage (Supabase), 
                      and social media integration (TikTok API). These services have their own privacy policies.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800">Legal Requirements</h3>
                    <p className="text-gray-700 text-sm">
                      We may disclose information when required by law, court order, or to protect our rights and safety.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800">Business Transfers</h3>
                    <p className="text-gray-700 text-sm">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-purple-600" />
                Data Security
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Secure cloud storage with access controls</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Employee training on data protection practices</li>
                  <li>Multi-factor authentication for admin access</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet 
                    or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">We retain your information for the following periods:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
                  <li><strong>Content Files:</strong> 90 days after publication or until storage limits are reached</li>
                  <li><strong>Analytics Data:</strong> 2 years for performance optimization</li>
                  <li><strong>Payment Records:</strong> 7 years for tax and legal compliance</li>
                  <li><strong>Support Communications:</strong> 3 years for quality assurance</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Privacy Rights</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                </ul>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                  <p className="text-purple-800 text-sm">
                    To exercise these rights, please contact us at <strong>privacy@vibeshots.com</strong>. 
                    We will respond within 30 days of receiving your request.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cookies and Tracking</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookies through your browser settings, but disabling them may affect functionality.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">International Data Transfers</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
                  safeguards are in place, including standard contractual clauses and adequacy decisions, to protect your data 
                  during international transfers.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Children's Privacy</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If you become aware that a child has provided us with personal information, please contact us 
                  immediately so we can delete such information.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to This Privacy Policy</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                  Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy 
                  periodically for any changes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="space-y-2">
                    <p className="text-purple-800 font-medium">Privacy Officer</p>
                    <p className="text-purple-800">Email: privacy@vibeshots.com</p>
                    <p className="text-purple-800">Address: 123 Innovation Drive, Tech City, TC 12345</p>
                    <p className="text-purple-800">Phone: +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};