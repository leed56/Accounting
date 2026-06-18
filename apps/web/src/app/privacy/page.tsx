import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export const metadata = {
  title: 'Privacy Policy — BizManager',
  description: 'How BizManager collects, uses, and protects your business data.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/login" className="text-lg font-bold text-primary">
            BizManager
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="card space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last updated: June 2026</p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            BizManager (&quot;we&quot;, &quot;our&quot;) helps small businesses in Sri Lanka manage finance,
            staff, and operations. This policy explains what data we collect and how we use it when you use
            our web and mobile apps.
          </p>

          <Section title="Information we collect">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Account data</strong> — email, name,
                phone, company name, and role when you sign up or are invited.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Business data</strong> — income and
                expense transactions, customer and supplier records, payroll, attendance, approvals,
                receipts you upload, and settings you configure.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Usage data</strong> — app interactions
                needed to run the service (e.g. sign-in times, device push tokens if you enable
                notifications).
              </li>
            </ul>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide dashboards, reports, payroll, approvals, and AI summaries for your company.</li>
              <li>Send account-related emails (invites, password reset) via our auth provider.</li>
              <li>Improve reliability and security of the service.</li>
            </ul>
            <p>We do not sell your personal or business data to third parties.</p>
          </Section>

          <Section title="Where data is stored">
            <p>
              Data is stored securely with Supabase (PostgreSQL and file storage). Access is restricted by
              company — each business only sees its own records (row-level security).
            </p>
          </Section>

          <Section title="Sharing">
            <p>We may share data only when:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You export or share reports (PDF, CSV, WhatsApp) yourself.</li>
              <li>Required by law or to protect rights and safety.</li>
              <li>
                With service providers who host infrastructure (e.g. Vercel, Supabase) under confidentiality.
              </li>
            </ul>
          </Section>

          <Section title="Retention">
            <p>
              We keep your data while your account is active. You may request deletion of your company account
              by contacting us; some records may be retained where required for legal or tax purposes.
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc pl-5 space-y-2">
              <li>Update company and profile details in Settings.</li>
              <li>Control notification preferences in Settings (web and mobile).</li>
              <li>Sign out on any device at any time.</li>
            </ul>
          </Section>

          <Section title="Security">
            <p>
              We use encrypted connections (HTTPS), authenticated access, and role-based permissions. You are
              responsible for keeping your password confidential.
            </p>
          </Section>

          <Section title="Children">
            <p>BizManager is intended for business use and is not directed at children under 13.</p>
          </Section>

          <Section title="Changes">
            <p>
              We may update this policy. Continued use after changes means you accept the updated policy.
              Material changes will be noted on this page.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about privacy:{' '}
              <a href="mailto:support@bizmanager.lk" className="text-primary font-medium">
                support@bizmanager.lk
              </a>
            </p>
            <p>
              Web app:{' '}
              <a
                href="https://accounting-one-fawn.vercel.app"
                className="text-primary font-medium"
              >
                accounting-one-fawn.vercel.app
              </a>
            </p>
          </Section>

          <Link href="/login" className="inline-block text-sm text-primary font-medium">
            ← Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}
