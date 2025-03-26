import React from 'react';

const FAQS = [
  {
    question: 'How do I place a bid?',
    answer: 'To place a bid, navigate to the auction item youre interested in and enter your bid amount. Make sure youre logged in and your bid is higher than the current highest bid.',
  },
  {
    question: 'How do I know if I won an auction?',
    answer: 'When you win an auction, you will receive an email notification. You can also check             our account dashboard for updates on your winning bids.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment gateway.',
  },
  {
    question: 'How is shipping handled?',
    answer: 'Shipping is handled by the seller. Once payment is confirmed, the seller will arrange shipping and provide tracking information.',
  },
  {
    question: 'Are the items authenticated?',
    answer: 'Yes, all items are verified by our team of experts before being listed. We ensure authenticity and accurate descriptions.',
  },
  {
    question: 'What if I receive a damaged item?',
    answer: 'Contact our support team immediately with photos of the damage. We will work with the seller to resolve the issue or provide a refund.',
  },
];

export function FAQ() {
  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-center font-serif text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          
          <div className="mt-8 space-y-6">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-amber-100 bg-amber-50 p-6"
              >
                <h3 className="font-serif text-lg font-semibold text-amber-800">
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Still have questions?{' '}
              <a href="/contact" className="text-amber-800 hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}