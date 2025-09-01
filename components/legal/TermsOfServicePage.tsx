
import React from 'react';
import { LandingPageLayout } from '../landing/LandingPageLayout';

interface LegalPageProps {
    onStartAuth: () => void;
    pageType: 'legal';
}

export const TermsOfServicePage: React.FC<LegalPageProps> = ({ onStartAuth, pageType }) => {
    const content = (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service (ToS)</h1>
            <div className="bg-white p-8 rounded-lg shadow-md border space-y-4 text-slate-700">
                <h2 className="text-xl font-semibold text-slate-800">1. Acceptance of Terms</h2>
                <p>By accessing or using our app, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.</p>

                <h2 className="text-xl font-semibold text-slate-800">2. User Accounts</h2>
                <p>You must create an account to access certain features of the app. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

                <h2 className="text-xl font-semibold text-slate-800">3. Subscription and Payment</h2>
                <p>The app may offer subscription plans that require payment. By subscribing, you authorize us to charge your payment method for the subscription fees. <strong>All sales are final.</strong> Subscription fees are non-refundable unless otherwise stated.</p>

                <h2 className="text-xl font-semibold text-slate-800">4. Cancellation Policy</h2>
                <p>You may cancel your subscription at any time. Upon cancellation, your access to the app will be terminated immediately. <strong>Upon cancellation, you forfeit any remaining access to your account and its features.</strong> No refunds will be issued for any unused portion of your subscription.</p>

                <h2 className="text-xl font-semibold text-slate-800">5. User Conduct</h2>
                <p>You agree not to use the app for any unlawful purpose or in a way that could damage, disable, or impair the app. You are solely responsible for any content you upload, post, or otherwise transmit through the app. We do not endorse or assume any responsibility for any content created or submitted by users.</p>

                <h2 className="text-xl font-semibold text-slate-800">6. Copyright Infringement</h2>
                <p>We respect the intellectual property rights of others and expect our users to do the same. You agree not to upload, post, or otherwise transmit any content that infringes the copyright, trademark, or other intellectual property rights of any third party.</p>

                <h2 className="text-xl font-semibold text-slate-800">7. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app, including but not to any claims related to copyright infringement or inappropriate use of the system.</p>

                <h2 className="text-xl font-semibold text-slate-800">8. Termination</h2>
                <p>We reserve the right to suspend or terminate your access to the app at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users.</p>

                <h2 className="text-xl font-semibold text-slate-800">9. Changes to Terms</h2>
                <p>We may update these Terms from time to time. We will notify you of any changes by posting the new Terms in the app. Your continued use of the app after changes are made constitutes your acceptance of the new Terms.</p>

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
};