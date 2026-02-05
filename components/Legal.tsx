
import React from 'react';

interface Props {
  onBack: () => void;
  page: 'privacy' | 'terms';
}

export const Legal: React.FC<Props> = ({ onBack, page }) => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white mb-8 flex items-center gap-2"
        >
          ← Back
        </button>

        {page === 'privacy' ? (
          <>
            <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
            <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
              <section>
                <h2 className="text-white font-bold mb-2">1. Data We Collect</h2>
                <p>We collect your expense data, budget information, and AI interaction history. This data is stored locally in your browser and optionally synced to our servers if you create an account.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">2. How We Use Your Data</h2>
                <p>Your data is used solely to provide the finance tracking and AI coaching services. We do not sell your data to third parties. AI interactions are processed through Google's Gemini API.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">3. Data Security</h2>
                <p>We use industry-standard encryption for data in transit and at rest. Your financial data is never shared with advertisers.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">4. Your Rights</h2>
                <p>You can export or delete your data at any time. Contact us at privacy@cannon.ai for data requests.</p>
              </section>
              
              <p className="text-gray-500 text-xs mt-8">Last updated: February 2025</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
            <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
              <section>
                <h2 className="text-white font-bold mb-2">1. Acceptance</h2>
                <p>By using CANN.ON.AI Finance, you agree to these terms. If you disagree, please do not use the service.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">2. Subscriptions</h2>
                <p>Pro and Business plans are billed monthly or annually. You can cancel anytime. No refunds for partial months.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">3. AI Limitations</h2>
                <p>Our AI coach provides financial insights but is not a licensed financial advisor. Always consult professionals for major financial decisions.</p>
              </section>
              
              <section>
                <h2 className="text-white font-bold mb-2">4. Liability</h2>
                <p>We are not liable for financial decisions made based on AI recommendations. Use at your own risk.</p>
              </section>
              
              <p className="text-gray-500 text-xs mt-8">Last updated: February 2025</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
