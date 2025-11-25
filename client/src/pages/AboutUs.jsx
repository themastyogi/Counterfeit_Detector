import React from 'react';
import { Shield, Target, Users, Award, CheckCircle, TrendingUp } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full mb-6">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                        About VeriScan
                    </h1>
                    <p className="text-xl text-text-muted max-w-3xl mx-auto">
                        Empowering businesses and consumers to fight counterfeits with cutting-edge AI technology
                    </p>
                </div>

                {/* Mission Section */}
                <div className="card mb-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
                            <p className="text-text-muted mb-4">
                                VeriScan is dedicated to protecting brands and consumers from the growing threat of counterfeit products.
                                Using advanced AI and machine learning, we provide instant, reliable authenticity verification for a wide
                                range of products.
                            </p>
                            <p className="text-text-muted">
                                Our platform combines Google Cloud Vision API with proprietary detection algorithms to identify fake
                                products with unprecedented accuracy, helping businesses maintain brand integrity and consumers make
                                confident purchasing decisions.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card bg-blue-50 border-l-4 border-accent p-4">
                                <div className="text-3xl font-bold text-accent mb-1">99%</div>
                                <div className="text-sm text-text-muted">Detection Accuracy</div>
                            </div>
                            <div className="card bg-green-50 border-l-4 border-green-500 p-4">
                                <div className="text-3xl font-bold text-green-600 mb-1">10K+</div>
                                <div className="text-sm text-text-muted">Scans Processed</div>
                            </div>
                            <div className="card bg-purple-50 border-l-4 border-purple-500 p-4">
                                <div className="text-3xl font-bold text-purple-600 mb-1">500+</div>
                                <div className="text-sm text-text-muted">Active Users</div>
                            </div>
                            <div className="card bg-orange-50 border-l-4 border-orange-500 p-4">
                                <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
                                <div className="text-sm text-text-muted">Support Available</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Values */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-primary text-center mb-8">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Target className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">Accuracy</h3>
                            </div>
                            <p className="text-text-muted">
                                We leverage state-of-the-art AI technology to deliver the most accurate counterfeit detection
                                results in the industry.
                            </p>
                        </div>

                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">Trust</h3>
                            </div>
                            <p className="text-text-muted">
                                Building trust through transparency, reliability, and consistent performance in every scan we process.
                            </p>
                        </div>

                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">Innovation</h3>
                            </div>
                            <p className="text-text-muted">
                                Continuously improving our algorithms and expanding our detection capabilities to stay ahead of counterfeiters.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="card mb-12 bg-gradient-to-br from-blue-50 to-purple-50">
                    <h2 className="text-3xl font-bold text-primary text-center mb-8">How VeriScan Works</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <span className="text-2xl font-bold text-accent">1</span>
                            </div>
                            <h4 className="font-bold text-primary mb-2">Upload Image</h4>
                            <p className="text-sm text-text-muted">Take a photo or upload an image of the product you want to verify</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <span className="text-2xl font-bold text-accent">2</span>
                            </div>
                            <h4 className="font-bold text-primary mb-2">AI Analysis</h4>
                            <p className="text-sm text-text-muted">Our AI examines logos, text, colors, and patterns for authenticity markers</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <span className="text-2xl font-bold text-accent">3</span>
                            </div>
                            <h4 className="font-bold text-primary mb-2">Risk Assessment</h4>
                            <p className="text-sm text-text-muted">Advanced algorithms calculate a risk score based on multiple factors</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <span className="text-2xl font-bold text-accent">4</span>
                            </div>
                            <h4 className="font-bold text-primary mb-2">Instant Results</h4>
                            <p className="text-sm text-text-muted">Receive detailed analysis with confidence scores and recommendations</p>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="card">
                    <h2 className="text-3xl font-bold text-primary mb-6">Why Choose VeriScan?</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Advanced AI Technology</h4>
                                <p className="text-sm text-text-muted">Powered by Google Cloud Vision API and proprietary algorithms</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Multi-Category Support</h4>
                                <p className="text-sm text-text-muted">Detect counterfeits across electronics, fashion, accessories, and more</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Instant Results</h4>
                                <p className="text-sm text-text-muted">Get authenticity verification in seconds, not days</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Detailed Reports</h4>
                                <p className="text-sm text-text-muted">Comprehensive analysis with risk scores and specific flags</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Scalable Solutions</h4>
                                <p className="text-sm text-text-muted">From individual users to enterprise-level deployments</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-primary mb-1">Continuous Improvement</h4>
                                <p className="text-sm text-text-muted">Regular updates to detection algorithms and supported categories</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
