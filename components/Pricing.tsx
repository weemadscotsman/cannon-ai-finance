
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubscribe: (plan: 'pro') => void;
  currentPlan?: 'free' | 'pro';
}

export const Pricing: React.FC<Props> = ({ onBack, onSubscribe, currentPlan = 'free' }) => {
  const plans = [
    {
      id: 'free' as const,
      name: 'Trial',
      price: 0,
      description: 'Try before you buy',
      features: [
        '20 AI interactions',
        'All features unlocked',
        'No credit card required',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'pro' as const,
      name: 'Lifetime',
      price: 4.99,
      period: ' one-time',
      description: 'Pay once, own forever',
      features: [
        'Unlimited AI interactions',
        'All features forever',
        'No subscription bs',
        'Future updates included',
      ],
      cta: currentPlan === 'free' ? 'Unlock for $4.99' : 'Unlocked',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
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
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple</h2>
          <p className="text-gray-400">No subscriptions. No bullshit. One price, yours forever.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
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
              
              {currentPlan === plan.id && plan.id === 'pro' && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Unlocked
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
                disabled={currentPlan === 'pro' && plan.id === 'pro'}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  currentPlan === 'pro' && plan.id === 'pro'
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

        {/* Trust */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-2">✓ 30-day money back guarantee ✓ Secure payment</p>
          <p className="text-gray-600 text-xs">Built by a solo dev who hates subscriptions too</p>
        </div>
      </div>
    </div>
  );
};
