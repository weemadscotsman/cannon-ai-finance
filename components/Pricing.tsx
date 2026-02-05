
import React, { useState } from 'react';
import { createCheckoutSession } from '../services/stripe';

interface Props {
  onBack: () => void;
  onSubscribe: (plan: 'pro' | 'business') => void;
  currentPlan?: 'free' | 'pro' | 'business';
}

export const Pricing: React.FC<Props> = ({ onBack, onSubscribe, currentPlan = 'free' }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const yearlyDiscount = 0.17; // 2 months free

  const plans = [
    {
      id: 'free' as const,
      name: 'Starter',
      price: 0,
      description: 'Get started with basic tracking',
      features: [
        'Up to 100 expenses',
        '50 AI interactions/month',
        'Basic receipt scanning',
        'Email support',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: billingCycle === 'monthly' ? 12 : 99,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For serious budgeters',
      features: [
        'Unlimited expenses',
        'Unlimited AI interactions',
        'Advanced receipt scanning',
        'Live voice coach',
        'Priority support',
        'Export to CSV/PDF',
      ],
      cta: currentPlan === 'free' ? 'Upgrade to Pro' : 'Current Plan',
      popular: true,
    },
    {
      id: 'business' as const,
      name: 'Business',
      price: billingCycle === 'monthly' ? 39 : 390,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For teams & power users',
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Shared budgets',
        'Admin dashboard',
        'API access',
        'White-label options',
      ],
      cta: currentPlan === 'business' ? 'Current Plan' : 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-black tracking-tight">CANN.ON.AI</h1>
          <div className="w-16" />
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple Pricing</h2>
          <p className="text-gray-400">Start free. Upgrade when you need more AI power.</p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex bg-gray-900 rounded-xl p-1 border border-gray-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border ${
                plan.popular 
                  ? 'bg-gradient-to-b from-emerald-950/50 to-black border-emerald-500/50' 
                  : 'bg-gray-950 border-gray-800'
              } ${currentPlan === plan.id ? 'ring-2 ring-emerald-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              
              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black">${plan.price}</span>
                {plan.period && <span className="text-gray-500">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.id !== 'free' && onSubscribe(plan.id)}
                disabled={currentPlan === plan.id || plan.id === 'free'}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  currentPlan === plan.id || plan.id === 'free'
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ / Trust */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>✓ Cancel anytime ✓ 30-day money back guarantee ✓ Secure payment</p>
        </div>
      </div>
    </div>
  );
};
