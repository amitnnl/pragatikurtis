import React from 'react';
import LegalPage from '../components/LegalPage';
import { BRAND_CONFIG } from '../config/branding';

export default function Terms() {
  return (
    <LegalPage 
      title="Terms of Service" 
      description={`Terms and Conditions for ${BRAND_CONFIG.name}`}
      lastUpdated="January 8, 2026"
    >
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and {BRAND_CONFIG.name} (“we,” “us” or “our”), 
          concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
        </p>
      </section>

      <section>
        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) 
          and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>
      </section>

      <section>
        <h2>3. User Representations</h2>
        <p>By using the Site, you represent and warrant that:</p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
        </ul>
      </section>

      <section>
        <h2>4. Purchases and Payment</h2>
        <p>
          We accept various forms of payment. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. 
          You further agree to promptly update your account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
          Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in INR (Indian Rupees).
        </p>
      </section>

      <section>
        <h2>5. Return Policy</h2>
        <p>
          Please review our Return Policy posted on the Site prior to making any purchases.
        </p>
      </section>

      <section>
        <h2>6. Governing Law</h2>
        <p>
          These Terms shall be governed by and defined following the laws of India. {BRAND_CONFIG.name} and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
        </p>
      </section>
    </LegalPage>
  );
}