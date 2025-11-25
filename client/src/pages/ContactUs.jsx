import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-1">Email</h3>
                                        <div className="space-y-1">
                                            <a href="mailto:support@veriscan.com" className="block text-text-muted hover:text-accent transition-colors">
                                                support@veriscan.com
                                            </a>
                                            <a href="mailto:themastyogi@gmail.com" className="block text-text-muted hover:text-accent transition-colors">
                                                themastyogi@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-1">Phone</h3>
                                        <div className="space-y-1">
                                            <a href="tel:+911234567890" className="block text-text-muted hover:text-accent transition-colors">
                                                +91 123 456 7890
                                            </a>
                                            <a href="tel:+918285424190" className="block text-text-muted hover:text-accent transition-colors">
                                                +91 828 542 4190
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-1">Address</h3>
                                        <p className="text-text-muted">
                                            123 Tech Park, Cyber City<br />
                                            Gurugram, Haryana 122002<br />
                                            India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-1">Business Hours</h3>
                                        <p className="text-text-muted">
                                            Monday - Friday: 9:00 AM - 6:00 PM<br />
                                            Saturday: 10:00 AM - 4:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
                            <h3 className="font-bold text-primary mb-4">Quick Support</h3>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Live Chat Support</span>
                                </a>
                                <a href="#" className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>FAQ & Help Center</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-primary mb-6">Send us a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-primary mb-2">Message Sent!</h3>
                                    <p className="text-text-muted mb-6">
                                        Thank you for contacting us. We'll get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="btn btn-primary"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-text-main mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="input-field w-full"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="input-field w-full"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-text-main mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="input-field w-full"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-text-main mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="6"
                                            className="input-field w-full resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-text-muted text-center">
                                        By submitting this form, you agree to our Privacy Policy and Terms of Service.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-primary mb-6">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-primary mb-2">How accurate is VeriScan?</h3>
                            <p className="text-text-muted text-sm">
                                VeriScan achieves 99% accuracy using advanced AI and machine learning algorithms powered by Google Cloud Vision API.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-primary mb-2">What products can be scanned?</h3>
                            <p className="text-text-muted text-sm">
                                We support electronics, fashion items, accessories, pharmaceuticals, and many other product categories.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-primary mb-2">How long does a scan take?</h3>
                            <p className="text-text-muted text-sm">
                                Most scans are completed within 2-5 seconds, providing instant authenticity verification results.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-primary mb-2">Is my data secure?</h3>
                            <p className="text-text-muted text-sm">
                                Yes, we use industry-standard encryption and security measures to protect all uploaded images and user data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
