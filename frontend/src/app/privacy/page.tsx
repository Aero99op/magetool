import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Magetool',
    description: 'Privacy Policy for Magetool - Learn how we handle your data.',
};

export default function PrivacyPage() {
    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
            <h1 className="tool-title" style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Privacy Policy</h1>

            <div className="glass-card" style={{ padding: '32px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>1. Introduction</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Welcome to Magetool. We value your privacy and are committed to protecting your personal information.
                        This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Data Collection</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We prioritize your privacy. <strong>We do not store your uploaded files.</strong> All file processing
                        (image resizing, video compression, etc.) is performed temporarily. Files are automatically deleted
                        from our servers shortly after processing is complete (typically within 1 hour).
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.6 }}>
                        <li>We do not collect personal identification information (PII) unless you voluntarily provide it (e.g., via contact forms).</li>
                        <li>We may collect non-personal data such as browser type, device type, and usage patterns to improve our service.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. Cookies and Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We use cookies to enhance your user experience. These are small text files stored on your device.
                        We may also use third-party analytics services (like Google Analytics) to understand how our website is used.
                        These services may use their own cookies.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Third-Party Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Our website may contain links to third-party websites or services. We are not responsible for the privacy
                        practices or content of these third-party sites. We encourage you to review their privacy policies.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>5. Security</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We implement appropriate technical and organizational measures to protect your data against unauthorized
                        access, alteration, disclosure, or destruction. However, no method of transmission over the internet
                        is 100% secure.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>6. Changes to This Policy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
                        updated revision date. Your continued use of the website after such changes constitutes your acceptance
                        of the new Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>7. Contact Us</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            If you have any questions about this Privacy Policy, please contact us at:<br />
                            <a href="mailto:spandanpatra9160@gmail.com" style={{ color: 'var(--neon-blue)', textDecoration: 'none' }}>spandanpatra9160@gmail.com</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
