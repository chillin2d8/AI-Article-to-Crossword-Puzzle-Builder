
import React from 'react';
import { LandingPageLayout } from '../landing/LandingPageLayout';

interface LegalPageProps {
    onStartAuth: () => void;
    pageType: 'legal';
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onStartAuth, pageType }) => {
    const content = (
        <main className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
            <div className="bg-white p-8 rounded-lg shadow-md border space-y-4 text-slate-700">
                <h2 className="text-xl font-semibold text-slate-800">1. Information We Collect</h2>
                <p><strong>Personal Information:</strong> We may collect personal information such as your name, email address, and payment information when you create an account or make a purchase.<br /><strong>Usage Data:</strong> We may collect information about how you use the app, including your IP address, device type, operating system, and interaction with the app.</p>

                <h2 className="text-xl font-semibold text-slate-800">2. How We Use Your Information</h2>
                <p>To provide and maintain our app and services. To process your transactions and manage your subscriptions. To communicate with you about your account, including sending updates and notifications. To improve our app and develop new features based on user feedback and usage patterns.</p>
                
                <h2 className="text-xl font-semibold text-slate-800">3. Sharing Your Information</h2>
                <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating the app and conducting our business, subject to confidentiality agreements. We may disclose your information if required by law or in response to valid requests by public authorities.</p>

                <h2 className="text-xl font-semibold text-slate-800">4. Data Security</h2>
                <p>We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or method of electronic storage is 100% secure.</p>

                <h2 className="text-xl font-semibold text-slate-800">5. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications at any time. If you wish to exercise any of these rights, please contact us using the information provided below.</p>

                <h2 className="text-xl font-semibold text-slate-800">6. Copyright and User Content</h2>
                <p>You are solely responsible for any content you upload, post, or otherwise transmit through the app. We do not endorse or assume any responsibility for any user-generated content. We respect the intellectual property rights of others and expect our users to do the same.</p>

                <h2 className="text-xl font-semibold text-slate-800">7. Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app. Your continued use of the app after changes are made constitutes your acceptance of the new Privacy Policy.</p>

                <h2 className="text-xl font-semibold text-slate-800">8. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us at info@play-app.app.</p>

                <h2 className="text-xl font-semibold text-slate-800">9. Governing Law</h2>
                <p>This Privacy Policy shall be governed by and construed in accordance with the laws of the State of Florida.</p>
            </div>
        </main>
    );

    return (
        <LandingPageLayout onStartAuth={onStartAuth} pageType={pageType}>
            {content}
        </LandingPageLayout>
    );
};