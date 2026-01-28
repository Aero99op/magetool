import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - Magetool',
    description: 'Terms of Service for Magetool - Rules and regulations for using our website.',
};

export default function TermsPage() {
    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
            <h1 className="tool-title" style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Terms of Service</h1>

            <div className="glass-card" style={{ padding: '32px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        By accessing or using Magetool, you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Use of Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Magetool provides online file processing tools. You agree to use these services only for lawful purposes.
                        You are strictly prohibited from uploading any content that is illegal, harmful, threatening, abusive,
                        harassing, defamatory, or otherwise objectionable.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. Intellectual Property</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        You retain all rights to the files you upload and process. We do not claim ownership of your content.
                        The design, code, and intellectual property of the Magetool website itself are owned by us and
                        protected by copyright laws.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Limitation of Liability</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Magetool is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied,
                        regarding the reliability, accuracy, or availability of our services. In no event shall Magetool be
                        liable for any direct, indirect, incidental, or consequential damages arising from your use of our service.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>5. Modifications</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof)
                        with or without notice. We may also update these Terms of Service from time to time.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>6. Governing Law</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        These terms shall be governed by and construed in accordance with the laws of India, without regard to
                        its conflict of law provisions.
                    </p>
                </section>
            </div>
        </div>
    );
}
