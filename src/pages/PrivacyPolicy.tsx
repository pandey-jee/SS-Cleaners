import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: December 4, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>
                When you use SS Cleaners services, we collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Service address and location details</li>
                <li>Booking preferences and special instructions</li>
                <li>Payment information (processed securely through our payment provider)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our cleaning services</li>
                <li>Process your bookings and payments</li>
                <li>Send you service updates and confirmations</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p>
                We do not sell or rent your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Payment processors for transaction processing</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p>
                We use cookies and similar technologies to improve your experience on our website, 
                analyze usage patterns, and deliver personalized content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Third-Party Services</h2>
              <p>
                Our website uses Google OAuth for authentication. Please review Google's Privacy Policy 
                to understand how they collect and process your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 18. We do not knowingly collect 
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page with an updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                Email: <a href="mailto:pandeyji252002@gmail.com" className="text-blue-600 hover:underline">pandeyji252002@gmail.com</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
