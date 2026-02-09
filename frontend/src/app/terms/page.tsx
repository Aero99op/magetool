import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - Magetool',
    description: 'Terms of Service for Magetool - Rules and regulations for usage.',
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
                        By accessing or using the Magetool website (<a href="https://magetool.in" style={{ color: 'var(--neon-blue)' }}>magetool.in</a>), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Use of Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Magetool provides online tools for file manipulation (images, videos, audio, documents). By using our services, you agree to:
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                        <li>Use the services only for lawful purposes.</li>
                        <li>Not upload content that violates any intellectual property rights or applicable laws.</li>
                        <li>Not upload malicious code, viruses, or any content that attempts to interfere with the service's operation.</li>
                        <li>Not attempt to reverse engineer, decompile, or scrape our services or content.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. Intellectual Property Rights</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong>Your Content:</strong> You retain all ownership rights to the files you upload, process, and download on Magetool. We do not claim any ownership over your content.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                        <strong>Our Content:</strong> The Magetool website, including its text, graphics, logos, code, and software, is the property of Magetool and is protected by copyright and other intellectual property laws.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Disclaimer of Warranties</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, textTransform: 'uppercase', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '4px' }}>
                        THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. MAGETOOL DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>5. Limitation of Liability</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        In no event shall Magetool, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>6. Termination</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>7. Governing Law</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>8. Changes to Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>9. Contact Us</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            If you have any questions about these Terms, please contact us at:<br />
                            <a href="mailto:spandanpatra9160@gmail.com" style={{ color: 'var(--neon-blue)', textDecoration: 'none' }}>spandanpatra9160@gmail.com</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
