import React from 'react';

export function About() {
  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-center font-serif text-4xl font-bold text-gray-900">About MayaBazaar</h1>
          
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Our Story</h2>
              <p className="mt-4 text-gray-600">
                MayaBazaar was founded with a passion for preserving and sharing the rich heritage of antiques and artifacts. Our platform connects collectors, enthusiasts, and sellers from around the world, creating a vibrant marketplace for unique historical pieces.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Our Mission</h2>
              <p className="mt-4 text-gray-600">
                We strive to make the world of antiques accessible to everyone while ensuring the authenticity and quality of every item. Our expert verification process and secure bidding system provide a trustworthy platform for buyers and sellers alike.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Why Choose Us</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-800">Expert Verification</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Every item is thoroughly verified by our team of antique experts.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-800">Secure Transactions</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Bank-grade security for all payments and personal information.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-800">Global Community</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Connect with collectors and sellers worldwide.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}