import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'SAATHI AI — Your Journey. Your People. Your Safety.',
  description: 'AI-Powered Women\'s Safety, Smart Journey Monitoring & Emergency Response Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('saathi_theme') || 'dark';
                document.documentElement.classList.add(t);
                document.documentElement.setAttribute('data-theme', t);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#fcfbfa] dark:bg-[#090d16] text-stone-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
