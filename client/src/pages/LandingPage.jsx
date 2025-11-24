import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Don't render landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-emerald-50 opacity-50 -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-accent font-semibold text-sm mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            New AI-Powered Detection Engine
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight mb-6 leading-tight">
            Detect Counterfeits with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">AI Precision</span>
          </h1>

          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Powered by Google Cloud Vision API, VeriScan helps you verify authenticity
            of currency, documents, and products in seconds with 99.9% accuracy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-primary border border-border font-bold text-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Hero Image / Animation Placeholder */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-20 bottom-0"></div>
            <div className="bg-surface rounded-2xl shadow-premium-xl border border-border p-4 md:p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs text-text-muted font-mono">analysis_result_v2.json</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden group">
                  <Shield size={64} className="text-gray-300 group-hover:text-accent transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-full w-full animate-scan"></div>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="text-success" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-text-muted">Status</div>
                      <div className="font-bold text-success">Likely Genuine</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Confidence Score</span>
                      <span className="font-bold">98.5%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[98.5%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <span className="font-semibold">AI Analysis:</span> No anomalies detected in watermark or micro-printing patterns.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Choose VeriScan?</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Our advanced technology provides enterprise-grade protection for your brand and customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={<Zap size={32} />}
              title="Lightning Fast"
              description="Get instant results with our optimized AI analysis engine. Process thousands of scans per hour."
              color="text-amber-500"
              bg="bg-amber-50"
            />
            <FeatureCard
              icon={<Lock size={32} />}
              title="Secure & Private"
              description="Your data is encrypted end-to-end. We adhere to strict enterprise security standards."
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <FeatureCard
              icon={<TrendingUp size={32} />}
              title="High Accuracy"
              description="Industry-leading 99%+ accuracy rate powered by Google Cloud Vision and custom ML models."
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, bg }) => (
  <div className="p-8 rounded-2xl bg-surface border border-border hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group">
    <div className={`w-16 h-16 rounded-xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
    <p className="text-text-muted leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
