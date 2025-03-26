import React from 'react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-center font-serif text-4xl font-bold text-gray-900">Privacy Policy</h1>
          
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Information We Collect</h2>
              <p className="mt-2 text-gray-600">
                We collect information you provide directly to us, including name, email address, 
                billing information, and any other information you choose to provide.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">How We Use Your Information</h2>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To process transactions and send related information</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Data Security</h2>
              <p className="mt-2 text-gray-600">
                We implement appropriate security measures to protect against unauthorized access, 
                alteration, disclosure, or destruction of your personal information.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Cookies</h2>
              <p className="mt-2 text-gray-600">
                We use cookies and similar tracking technologies to track activity on our Service 
                and hold certain information to improve and analyze our Service.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Third-Party Services</h2>
              <p className="mt-2 text-gray-600">
                We may employ third-party companies and individuals to facilitate our Service, 
                provide the Service on our behalf, or assist us in analyzing how our Service is used.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-amber-800">Changes to This Policy</h2>
              <p className="mt-2 text-gray-600">
                We may update our Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the date below.
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