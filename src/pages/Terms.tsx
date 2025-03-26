import React from 'react';

export function Terms() {
  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-center font-serif text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">1. Acceptance of Terms</h2>
              <p className="mt-2 text-gray-600">
                By accessing and using MayaBazaar, you agree to be bound by these Terms and Conditions 
                and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">2. Auction Rules</h2>
              <div className="mt-2 space-y-2 text-gray-600">
                <p>2.1. All bids are final and binding.</p>
                <p>2.2. The highest bid at the end of the auction period wins.</p>
                <p>2.3. Buyers must complete payment within 48 hours of auction end.</p>
                <p>2.4. Sellers must ship items within 5 business days of payment completion.</p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">3. User Responsibilities</h2>
              <div className="mt-2 space-y-2 text-gray-600">
                <p>3.1. Provide accurate and complete information.</p>
                <p>3.2. Maintain the confidentiality of your account.</p>
                <p>3.3. Not engage in fraudulent or deceptive practices.</p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">4. Item Authenticity</h2>
              <p className="mt-2 text-gray-600">
                Sellers must guarantee the authenticity of their items. MayaBazaar reserves the right 
                to remove listings that violate our authenticity standards.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">5. Fees & Payments</h2>
              <div className="mt-2 space-y-2 text-gray-600">
                <p>5.1. Platform fee: 5% of final sale price.</p>
                <p>5.2. Payment processing fee: 2.9% + $0.30 per transaction.</p>
                <p>5.3. All fees are non-refundable.</p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">6. Dispute Resolution</h2>
              <p className="mt-2 text-gray-600">
                Any disputes will be resolved through our mediation process. Users agree to cooperate 
                in good faith to resolve any conflicts.
              </p>
            </section>

            <div className="mt-8 text-center text-sm text-gray-500">
              Last updated: March 1, 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}