import React from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full mb-6">
                        <Scale className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-text-muted">
                        Last updated: November 25, 2025
                    </p>
                </div>

                <div className="card space-y-8">
                    {/* Introduction */}
                    <section>
                        <p className="text-text-muted">
                            Welcome to VeriScan. By accessing or using our counterfeit detection service, you agree to be bound
                            by these Terms of Service. Please read them carefully.
                        </p>
                    </section>

                    {/* Acceptance of Terms */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <h2 className="text-2xl font-bold text-primary">Acceptance of Terms</h2>
                        </div>

                        <p className="text-text-muted">
                            By creating an account or using VeriScan, you acknowledge that you have read, understood, and agree
                            to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our service.
                        </p>
                    </section>

                    {/* Service Description */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">Service Description</h2>
                        </div>

                        <p className="text-text-muted mb-4">
                            VeriScan provides AI-powered counterfeit detection services including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Image analysis using Google Cloud Vision API</li>
                            <li>Authenticity verification for various product categories</li>
                            <li>Risk assessment and detailed reporting</li>
                            <li>Scan history and analytics</li>
                        </ul>
                    </section>

                    {/* User Accounts */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">User Accounts</h2>

                        <h3 className="font-bold text-primary mb-2">Account Creation</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted mb-4">
                            <li>You must provide accurate and complete information</li>
                            <li>You are responsible for maintaining account security</li>
                            <li>You must be at least 18 years old to create an account</li>
                            <li>One person or entity may not maintain multiple accounts</li>
                        </ul>

                        <h3 className="font-bold text-primary mb-2">Account Termination</h3>
                        <p className="text-text-muted">
                            We reserve the right to suspend or terminate accounts that violate these terms or engage in
                            fraudulent, abusive, or illegal activities.
                        </p>
                    </section>

                    {/* Acceptable Use */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                            <h2 className="text-2xl font-bold text-primary">Acceptable Use Policy</h2>
                        </div>

                        <p className="text-text-muted mb-4">You agree NOT to:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Upload illegal, harmful, or offensive content</li>
                            <li>Attempt to reverse engineer or hack our service</li>
                            <li>Use the service to create counterfeit products</li>
                            <li>Share your account credentials with others</li>
                            <li>Exceed your subscription's usage limits</li>
                            <li>Scrape or automatically collect data from our service</li>
                            <li>Interfere with other users' access to the service</li>
                        </ul>
                    </section>

                    {/* Subscription and Payments */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Subscription and Payments</h2>

                        <h3 className="font-bold text-primary mb-2">Pricing</h3>
                        <p className="text-text-muted mb-4">
                            Subscription fees are billed in advance on a monthly or annual basis. Prices are subject to change
                            with 30 days notice.
                        </p>

                        <h3 className="font-bold text-primary mb-2">Refunds</h3>
                        <p className="text-text-muted mb-4">
                            Refunds are provided on a case-by-case basis. Contact support within 7 days of purchase for refund requests.
                        </p>

                        <h3 className="font-bold text-primary mb-2">Cancellation</h3>
                        <p className="text-text-muted">
                            You may cancel your subscription at any time. Access will continue until the end of your billing period.
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Intellectual Property</h2>

                        <p className="text-text-muted mb-4">
                            All content, features, and functionality of VeriScan are owned by us and protected by copyright,
                            trademark, and other intellectual property laws.
                        </p>

                        <h3 className="font-bold text-primary mb-2">Your Content</h3>
                        <p className="text-text-muted">
                            You retain ownership of images you upload. By uploading, you grant us a license to process and
                            analyze them for providing our service and improving our algorithms.
                        </p>
                    </section>

                    {/* Disclaimers */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <XCircle className="h-6 w-6 text-red-600" />
                            <h2 className="text-2xl font-bold text-primary">Disclaimers and Limitations</h2>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                            <p className="text-sm text-text-muted">
                                <strong>Important:</strong> VeriScan provides detection services for informational purposes only.
                                While we strive for accuracy, we cannot guarantee 100% accuracy in all cases.
                            </p>
                        </div>

                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Results should not be the sole basis for legal or financial decisions</li>
                            <li>We are not liable for damages resulting from reliance on our service</li>
                            <li>Service is provided "as is" without warranties of any kind</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Limitation of Liability</h2>

                        <p className="text-text-muted">
                            To the maximum extent permitted by law, VeriScan shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages, or any loss of profits or revenues.
                        </p>
                    </section>

                    {/* Indemnification */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Indemnification</h2>

                        <p className="text-text-muted">
                            You agree to indemnify and hold VeriScan harmless from any claims, damages, or expenses arising from
                            your use of the service or violation of these terms.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Governing Law</h2>

                        <p className="text-text-muted">
                            These Terms shall be governed by the laws of India. Any disputes shall be resolved in the courts
                            of Gurugram, Haryana.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Changes to Terms</h2>

                        <p className="text-text-muted">
                            We reserve the right to modify these Terms at any time. We will notify users of significant changes
                            via email or service notification. Continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-blue-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-primary mb-4">Contact Information</h2>

                        <p className="text-text-muted mb-4">
                            For questions about these Terms of Service, please contact us:
                        </p>
                        <ul className="space-y-2 text-text-muted">
                            <li><strong>Email:</strong> legal@veriscan.com</li>
                            <li><strong>Phone:</strong> +91 123 456 7890</li>
                            <li><strong>Address:</strong> 123 Tech Park, Cyber City, Gurugram, Haryana 122002, India</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
