import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Magetool',
    description: 'Privacy Policy for Magetool - Learn about our data collection, cookies, and privacy practices.',
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
                        Welcome to Magetool ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information.
                        This Privacy Policy describes how we collect, use, and safeguard your data when you visit our website <a href="https://magetool.in" style={{ color: 'var(--neon-blue)' }}>magetool.in</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Information We Collect</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                        We collect limited information to provide and improve our services:
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li><strong>Voluntarily Provided Information:</strong> We may collect personal information (like email address) only if you voluntarily provide it through our contact forms or newsletter subscriptions.</li>
                        <li><strong>Automatically Collected Information:</strong> When you access our website, we may collect certain information automatically, including your IP address, browser type, operating system, and usage patterns.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. File Processing and Security</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                        Your file privacy is our top priority.
                    </p>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--neon-blue)' }}>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            <strong>We do NOT store your files permanently.</strong>
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
                            All file processing (image conversion, video compression, PDF merges, etc.) is performed either entirely client-side (in your browser) or temporarily on our secure servers. Files sent to our servers are automatically deleted immediately after processing is complete. We do not sell, share, or view your uploaded content.
                        </p>
                    </div>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Cookies and Tracking Technologies</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                    </p>
                    <h3 style={{ fontSize: '1.2rem', margin: '16px 0 8px', color: 'var(--text-primary)' }}>Google AdSense & DoubleClick Cookie</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Google, as a third-party vendor, uses cookies to serve ads on our Service. Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users based on their visit to our Service or other websites on the Internet.
                        You may opt out of the use of the DoubleClick Cookie for interest-based advertising by visiting the <a href="https://www.google.com/ads/preferences/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)' }}>Google Ads Settings</a> page.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>5. Third-Party Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We may employ third-party companies and individuals due to the following reasons:
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                        <li>To facilitate our Service;</li>
                        <li>To provide the Service on our behalf;</li>
                        <li>To perform Service-related services; or</li>
                        <li>To assist us in analyzing how our Service is used (e.g., Google Analytics).</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>6. GDPR & CCPA Compliance</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong>GDPR (General Data Protection Regulation):</strong> Detailed information on the processing of personal data can be found in this policy. You have the right to access, rectify, or erase your personal data.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                        <strong>CCPA (California Consumer Privacy Act):</strong> We do not sell your personal information. California residents have specific rights regarding their personal information.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>7. Children's Privacy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>8. Changes to This Privacy Policy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>9. Contact Us</h2>
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
