import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: December 4, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using SS Cleaners services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Services Description</h2>
              <p>
                SS Cleaners provides professional cleaning services for residential and commercial properties. 
                Services include but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Deep cleaning</li>
                <li>Regular maintenance cleaning</li>
                <li>Move-in/move-out cleaning</li>
                <li>Office cleaning</li>
                <li>Specialized cleaning services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Booking and Cancellation</h2>
              <p>
                <strong>Booking:</strong> All bookings must be made through our website or by contacting us directly. 
                Bookings are subject to availability.
              </p>
              <p className="mt-2">
                <strong>Cancellation:</strong> You may cancel or reschedule your booking up to 24 hours before 
                the scheduled service time without penalty. Cancellations made less than 24 hours in advance 
                may be subject to a cancellation fee.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Pricing and Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prices are quoted based on the information you provide</li>
                <li>Final pricing may be adjusted based on actual property conditions</li>
                <li>Payment is due upon completion of services unless otherwise arranged</li>
                <li>We accept various payment methods including credit cards and online payments</li>
                <li>All prices are in your local currency and include applicable taxes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Customer Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information about your property and cleaning requirements</li>
                <li>Ensure safe access to the property for our cleaning staff</li>
                <li>Secure or remove valuable and fragile items before our arrival</li>
                <li>Inform us of any specific concerns or requirements before service</li>
                <li>Provide a safe working environment for our staff</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Service Quality Guarantee</h2>
              <p>
                We strive to provide high-quality cleaning services. If you're not satisfied with our service, 
                please contact us within 24 hours, and we will make reasonable efforts to address your concerns, 
                which may include re-cleaning the affected areas at no additional charge.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Liability and Insurance</h2>
              <p>
                SS Cleaners is fully insured. While we take utmost care, we are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pre-existing damage not reported before service</li>
                <li>Damage to items not properly secured or fragile items left unsecured</li>
                <li>Loss of items not reported within 24 hours of service</li>
                <li>Damage caused by factors beyond our control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Privacy and Confidentiality</h2>
              <p>
                We respect your privacy and maintain confidentiality regarding your property and personal information. 
                Please refer to our Privacy Policy for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Intellectual Property</h2>
              <p>
                All content on the SS Cleaners website, including text, graphics, logos, and images, 
                is the property of SS Cleaners and protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p>
                We reserve the right to refuse service or terminate our relationship with any customer 
                for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Non-payment</li>
                <li>Abusive or threatening behavior toward staff</li>
                <li>Unsafe working conditions</li>
                <li>Violation of these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be 
                effective immediately upon posting on our website. Your continued use of our services 
                constitutes acceptance of any modifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with applicable local laws. 
                Any disputes shall be resolved in the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                Email: <a href="mailto:pandeyji252002@gmail.com" className="text-blue-600 hover:underline">pandeyji252002@gmail.com</a>
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-6">
              <p className="text-sm">
                By using SS Cleaners services, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
