


import React from 'react';
import { LandingPageLayout } from '../landing/LandingPageLayout';

interface LegalPageProps {
    onStartAuth: () => void;
    pageType: 'legal';
}

export const TermsOfServicePage: React.FC<LegalPageProps> = React.memo(({ onStartAuth, pageType }) => {
    const content = (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service (ToS)</h1>
            <div className="bg-white p-8 rounded-lg shadow-md border space-y-4 text-slate-700">
                <h2 className="text-xl font-semibold text-slate-800">1. Acceptance of Terms</h2>
                <p>By accessing or using our app ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you are not permitted to use the Service.</p>

                <h2 className="text-xl font-semibold text-slate-800">2. User Accounts</h2>
                <p>You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

                <h2 className="text-xl font-semibold text-slate-800">3. Subscription and Payment</h2>
                <p>The Service offers subscription plans that require payment. By subscribing, you authorize us to charge your payment method for the subscription fees. <strong>All sales are final.</strong> Subscription fees are non-refundable unless otherwise stated.</p>

                <h2 className="text-xl font-semibold text-slate-800">4. Cancellation Policy</h2>
                <p>You may cancel your subscription at any time through the customer billing portal. Upon cancellation, your subscription will remain active until the end of the current billing period. No refunds will be issued for any unused portion of your subscription.</p>

                <h2 className="text-xl font-semibold text-slate-800">5. User Conduct and Content Policy</h2>
                <p>You agree not to use the Service for any unlawful purpose or to generate content that is hateful, harassing, sexually explicit, or dangerously harmful. You are solely responsible for any content you generate using the Service.</p>
                <p>We employ automated systems to monitor user-generated content for violations of this policy. You acknowledge and agree that your content may be programmatically reviewed for compliance.</p>
                
                <h2 className="text-xl font-semibold text-slate-800">6. Copyright and Intellectual Property</h2>
                <p>You agree not to process any text or materials for which you do not hold the necessary legal rights or licenses. The Service is a tool, and you are solely responsible for ensuring that your use of it does not infringe on the intellectual property rights of others.</p>

                <h2 className="text-xl font-semibold text-slate-800">7. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. The Service is provided "as is" without warranties of any kind.</p>

                <h2 className="text-xl font-semibold text-slate-800">8. Enforcement and Termination</h2>
                <p>We reserve the right to enforce this policy at our sole discretion. Violations of the User Conduct policy will be handled according to a "three-strikes" system:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>First Violation:</strong> A formal warning will be issued to your account's email address.</li>
                    <li><strong>Second Violation:</strong> Your account will be temporarily suspended.</li>
                    <li><strong>Third Violation:</strong> Your account will be permanently terminated without refund.</li>
                </ul>
                <p>We reserve the right to suspend or terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users.</p>

                <h2 className="text-xl font-semibold text-slate-800">9. Changes to Terms</h2>
                <p>We may update these Terms from time to time. Your continued use of the Service after changes are made constitutes your acceptance of the new Terms.</p>

                <h2 className="text-xl font-semibold text-slate-800">10. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of the State of Florida.</p>
            </div>
        </div>
    );

    return (
        <LandingPageLayout onStartAuth={onStartAuth} pageType={pageType}>
            {content}
        </LandingPageLayout>
    );
});