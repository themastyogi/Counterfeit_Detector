import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full mb-6">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-text-muted">
                        Last updated: November 25, 2025
                    </p>
                </div>

                <div className="card space-y-8">
                    {/* Introduction */}
                    <section>
                        <p className="text-text-muted">
                            At VeriScan, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                            and safeguard your information when you use our counterfeit detection service.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">Information We Collect</h2>
                        </div>

                        <h3 className="font-bold text-primary mb-2">Personal Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted mb-4">
                            <li>Name and email address when you register</li>
                            <li>Contact information you provide</li>
                            <li>Payment information for premium subscriptions</li>
                            <li>Company information for business accounts</li>
                        </ul>

                        <h3 className="font-bold text-primary mb-2">Usage Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-muted mb-4">
                            <li>Images uploaded for authenticity verification</li>
                            <li>Scan history and results</li>
                            <li>Device information and IP address</li>
                            <li>Browser type and operating system</li>
                            <li>Pages visited and features used</li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">How We Use Your Information</h2>
                        </div>

                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>To provide and maintain our counterfeit detection service</li>
                            <li>To process your scans using AI and machine learning</li>
                            <li>To improve our detection algorithms and accuracy</li>
                            <li>To send you service updates and notifications</li>
                            <li>To respond to your inquiries and support requests</li>
                            <li>To detect and prevent fraud or abuse</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">Data Security</h2>
                        </div>

                        <p className="text-text-muted mb-4">
                            We implement industry-standard security measures to protect your information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure cloud storage with Google Cloud Platform</li>
                            <li>Regular security audits and updates</li>
                            <li>Access controls and authentication</li>
                            <li>Monitoring for unauthorized access</li>
                        </ul>
                    </section>

                    {/* Third-Party Services */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">Third-Party Services</h2>
                        </div>

                        <p className="text-text-muted mb-4">
                            We use the following third-party services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li><strong>Google Cloud Vision API:</strong> For image analysis and counterfeit detection</li>
                            <li><strong>Payment Processors:</strong> For processing subscription payments</li>
                            <li><strong>Analytics Services:</strong> To understand how our service is used</li>
                        </ul>
                        <p className="text-text-muted mt-4">
                            These services have their own privacy policies and we encourage you to review them.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-accent" />
                            <h2 className="text-2xl font-bold text-primary">Data Retention</h2>
                        </div>

                        <p className="text-text-muted">
                            We retain your personal information and scan data for as long as necessary to provide our services
                            and comply with legal obligations. You can request deletion of your data at any time by contacting us.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Your Rights</h2>

                        <p className="text-text-muted mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your scan history</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent for data processing</li>
                        </ul>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Cookies and Tracking</h2>

                        <p className="text-text-muted">
                            We use cookies and similar tracking technologies to improve your experience, analyze usage,
                            and remember your preferences. You can control cookie settings through your browser.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Children's Privacy</h2>

                        <p className="text-text-muted">
                            Our service is not intended for children under 13 years of age. We do not knowingly collect
                            personal information from children under 13.
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Policy</h2>

                        <p className="text-text-muted">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by
                            posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-blue-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>

                        <p className="text-text-muted mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <ul className="space-y-2 text-text-muted">
                            <li><strong>Email:</strong> privacy@veriscan.com</li>
                            <li><strong>Phone:</strong> +91 123 456 7890</li>
                            <li><strong>Address:</strong> 123 Tech Park, Cyber City, Gurugram, Haryana 122002, India</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
