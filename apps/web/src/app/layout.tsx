import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'BizManager — Smart Business Suite',
  description: 'Manage your small business from your phone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body{margin:0;font-family:Inter,system-ui,sans-serif;background:#FAFBFC;color:#111827}
              .login-hero{display:none!important}
              @media(min-width:1024px){.login-hero{display:flex!important;width:50%}}
              .login-shell{min-height:100vh;display:flex;flex-direction:column}
              @media(min-width:1024px){.login-shell{flex-direction:row}}
              .login-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:#FAFBFC}
              .login-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem;max-width:28rem;width:100%;box-shadow:0 8px 24px rgba(0,0,0,.12)}
              .input-field{width:100%;border:1px solid #E5E7EB;border-radius:8px;padding:0.625rem 0.75rem;font-size:14px;min-height:44px;box-sizing:border-box;background:#fff}
              .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;width:100%;background:#16A34A;color:#fff;border:none;border-radius:8px;padding:0.625rem 1rem;font-size:14px;font-weight:600;min-height:44px;cursor:pointer}
              .label{display:block;font-size:14px;font-weight:500;margin-bottom:.375rem;color:#374151}
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
