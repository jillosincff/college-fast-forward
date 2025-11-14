import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('LandingPage')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">
            <strong>Effective Date:</strong> January 1, 2025<br />
            <strong>Last Updated:</strong> January 1, 2025
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to College Fast Forward ("we," "us," or "our"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at collegefastforward.com (the "Platform").
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using College Fast Forward, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.1 Information You Provide to Us</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect information that you voluntarily provide when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Create an account:</strong> Name, email address, graduation year, major, school affiliation (University of Florida)</li>
                <li><strong>Complete your profile:</strong> Profile photo, bio, headline, current company, job title, industry, location, LinkedIn URL, skills, and career goals</li>
                <li><strong>Post content:</strong> Job requests, roommate listings, opportunity postings, help offers, messages, and comments</li>
                <li><strong>Upload files:</strong> Resumes, profile images, and other documents you choose to share</li>
                <li><strong>Communicate with us:</strong> Feedback, support requests, and correspondence</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.2 Information Collected Automatically</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you use our Platform, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, links clicked, and other actions taken on the Platform</li>
                <li><strong>Device Information:</strong> IP address, browser type and version, device type, operating system, and unique device identifiers</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar technologies to enhance your experience. See Section 7 for more details.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.3 Information from Third Parties</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may receive information about you from third parties, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Authentication Providers:</strong> When you sign in using Google or other single sign-on (SSO) services, we receive basic profile information (name, email, profile photo) as permitted by your privacy settings with those services</li>
                <li><strong>Public Sources:</strong> Information that is publicly available, such as LinkedIn profiles you share with us</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Provide and maintain our services:</strong> Create and manage your account, facilitate connections between students, alumni, and parents, enable job and roommate searches, and deliver requested services</li>
                <li><strong>Improve our Platform:</strong> Analyze usage patterns, conduct research, develop new features, and enhance user experience</li>
                <li><strong>Communicate with you:</strong> Send notifications about activity on your posts, messages from other users, platform updates, and marketing communications (with your consent)</li>
                <li><strong>Personalization:</strong> Recommend relevant connections, opportunities, and content based on your profile and preferences</li>
                <li><strong>Safety and security:</strong> Detect and prevent fraud, abuse, and other harmful activities; enforce our Terms of Service</li>
                <li><strong>Legal compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
                <li><strong>With your consent:</strong> For any other purpose disclosed to you when we collect the information or with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.1 With Other Users</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                College Fast Forward is a networking platform. When you post job requests, roommate listings, help offers, or other content, that information is visible to other users according to your privacy settings. Your profile information (name, photo, bio, major, graduation year) may be visible to other users when you interact on the Platform.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.2 Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may share your information with third-party service providers who perform services on our behalf, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Cloud hosting and storage providers (Supabase, AWS)</li>
                <li>Email delivery services (SendGrid)</li>
                <li>Analytics providers (Google Analytics)</li>
                <li>Payment processors (Stripe) - only if you make payments through the Platform</li>
                <li>AI/ML services (OpenAI) - for features like resume optimization and LinkedIn Scout</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                These service providers are contractually obligated to use your information only to provide services to us and are prohibited from using or disclosing your information for any other purpose.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.3 Business Transfers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If we are involved in a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our Platform of any change in ownership or use of your personal information.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.4 Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court, government agency, or law enforcement).
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.5 With Your Consent</h3>
              <p className="text-slate-700 leading-relaxed">
                We may share your information for any other purpose disclosed to you and with your consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Your Privacy Rights and Choices</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.1 Access and Portability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can access and review your personal information by logging into your account and visiting your profile settings. You may request a copy of your data by contacting us at privacy@collegefastforward.com.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.2 Correction and Update</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can update your profile information at any time through your account settings. If you need assistance, contact us at support@collegefastforward.com.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.3 Deletion</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can request deletion of your account and personal information by visiting your profile settings or contacting us at privacy@collegefastforward.com. Please note that we may retain certain information as required by law or for legitimate business purposes.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.4 Marketing Communications</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can opt out of receiving marketing emails by clicking the "unsubscribe" link in any marketing email or by adjusting your notification preferences in your account settings. Please note that even if you opt out of marketing communications, we may still send you transactional and service-related messages.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.5 Directory Visibility</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can control whether your profile appears in the Gator Directory by toggling the "Include in Directory" setting in your profile settings.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">5.6 Do Not Track</h3>
              <p className="text-slate-700 leading-relaxed">
                Our Platform does not currently respond to "Do Not Track" signals from browsers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure cloud infrastructure (Base44, Supabase, AWS)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">Types of Cookies We Use:</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Essential Cookies:</strong> Required for the Platform to function properly (e.g., authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform (Google Analytics)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.
              </p>

              <p className="text-slate-700 leading-relaxed">
                For more information about cookies, please see our <a href="#/CookiePolicy" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Third-Party Services</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Platform may contain links to third-party websites, services, or applications that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the privacy policy of every site you visit.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Third-party services we integrate with include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Google (authentication, analytics)</li>
                <li>LinkedIn (for profile integration and job searching)</li>
                <li>Stripe (payment processing)</li>
                <li>OpenAI (AI-powered features)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Platform is designed for college students (typically 18 years and older), alumni, and parents. We do not knowingly collect personal information from children under 13 years of age. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to delete that information.
              </p>
              <p className="text-slate-700 leading-relaxed">
                If you are a parent or guardian and you believe your child has provided us with personal information, please contact us at privacy@collegefastforward.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-slate-700 leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal, tax, audit, or regulatory purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
              </p>
              <p className="text-slate-700 leading-relaxed">
                If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including personal information, to the United States and process it there. By using our Platform, you consent to this transfer and processing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. California Privacy Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Right to Know:</strong> You can request information about the personal information we collect, use, disclose, and sell</li>
                <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> You can opt out of the sale of your personal information (note: we do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                To exercise these rights, please contact us at privacy@collegefastforward.com or visit your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date at the top of this Privacy Policy</li>
                <li>Sending you an email notification (for material changes)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <p className="text-slate-700 mb-2">
                  <strong>College Fast Forward</strong>
                </p>
                <p className="text-slate-700 mb-2">
                  Email: <a href="mailto:privacy@collegefastforward.com" className="text-blue-600 hover:underline">privacy@collegefastforward.com</a>
                </p>
                <p className="text-slate-700 mb-2">
                  Support: <a href="mailto:support@collegefastforward.com" className="text-blue-600 hover:underline">support@collegefastforward.com</a>
                </p>
                <p className="text-slate-700">
                  Website: <a href="https://www.collegefastforward.com" className="text-blue-600 hover:underline">www.collegefastforward.com</a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                © {new Date().getFullYear()} College Fast Forward. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PrivacyPolicy.isPublic = true;